package com.CGL.cgl.Controller;

import com.CGL.cgl.DTO.AuthResponse;
import com.CGL.cgl.DTO.ChangePasswordRequest;
import com.CGL.cgl.DTO.LoginRequest;
import com.CGL.cgl.DTO.RegisterRequest;
import com.CGL.cgl.Exception.ConflictException;
import com.CGL.cgl.Exception.ResourceNotFoundException;
import com.CGL.cgl.Model.Users;
import com.CGL.cgl.Repo.UserRepo;
import com.CGL.cgl.Security.JwtUtil;
import com.CGL.cgl.Service.CustomUserDetailsService;
import com.CGL.cgl.Service.RegisterService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class AuthController {

    private final RegisterService registerService;
    private final AuthenticationManager authenticationManager;
    private final CustomUserDetailsService customUserDetailsService;
    private final JwtUtil jwtUtil;
    private final UserRepo userRepo;
    private final BCryptPasswordEncoder passwordEncoder;

    public AuthController(
        RegisterService registerService,
        AuthenticationManager authenticationManager,
        CustomUserDetailsService customUserDetailsService,
        JwtUtil jwtUtil,
        UserRepo userRepo,
        BCryptPasswordEncoder passwordEncoder
    ) {
        this.registerService = registerService;
        this.authenticationManager = authenticationManager;
        this.customUserDetailsService = customUserDetailsService;
        this.jwtUtil = jwtUtil;
        this.userRepo = userRepo;
        this.passwordEncoder = passwordEncoder;
    }

    @PostMapping("/auth/register")
    public ResponseEntity<String> register(
        @RequestBody RegisterRequest request
    ) {
        registerService.createUser(request);
        return ResponseEntity.status(201).body("User registered successfully");
    }

    @PostMapping("/auth/login")
    public ResponseEntity<AuthResponse> login(
        @RequestBody LoginRequest request
    ) {
        UserDetails userDetails = customUserDetailsService.loadUserByUsername(
            request.getEmail()
        );

        authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(
                request.getEmail(),
                request.getPassword()
            )
        );

        String token = jwtUtil.generateToken(userDetails);

        Users user = userRepo.findByEmail(request.getEmail()).orElse(null);

        AuthResponse response = new AuthResponse(
            token,
            userDetails.getAuthorities().iterator().next().getAuthority(),
            request.getEmail(),
            user != null && user.isMustChangePassword()
        );

        return ResponseEntity.ok(response);
    }

    // Used both for the forced "set your own password" prompt after a
    // SUPER_ADMIN-created first login, and as a general change-password
    // action any authenticated user can use at any time.
    @PutMapping("/auth/change-password")
    public ResponseEntity<Void> changePassword(
        @RequestBody ChangePasswordRequest request
    ) {
        String email = SecurityContextHolder.getContext()
            .getAuthentication()
            .getName();

        Users user = userRepo.findByEmail(email)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new BadCredentialsException("Current password is incorrect");
        }

        if (request.getNewPassword() == null || request.getNewPassword().length() < 8) {
            throw new ConflictException("New password must be at least 8 characters long");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        user.setMustChangePassword(false);
        userRepo.save(user);

        return ResponseEntity.noContent().build();
    }

    @ExceptionHandler(UsernameNotFoundException.class)
    public ResponseEntity<String> handleUsernameNotFound(
        UsernameNotFoundException ex
    ) {
        String message =
            ex.getMessage() != null
                ? ex.getMessage()
                : "Invalid email or password";
        HttpStatus status = message.toLowerCase().contains("verify your email")
            ? HttpStatus.FORBIDDEN
            : HttpStatus.UNAUTHORIZED;
        return ResponseEntity.status(status).body(message);
    }

    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<String> handleBadCredentials(
        BadCredentialsException ex
    ) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(
            "Invalid email or password"
        );
    }
}
