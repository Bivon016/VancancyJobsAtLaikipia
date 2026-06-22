package com.CGL.cgl.Controller;

import com.CGL.cgl.DTO.AuthResponse;
import com.CGL.cgl.DTO.LoginRequest;
import com.CGL.cgl.DTO.RegisterRequest;
import com.CGL.cgl.Security.JwtUtil;
import com.CGL.cgl.Service.CustomUserDetailsService;
import com.CGL.cgl.Service.RegisterService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.web.authentication.HttpStatusEntryPoint;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class AuthController {

    private final RegisterService registerService;
    private final AuthenticationManager authenticationManager;
    private final CustomUserDetailsService customUserDetailsService;
    private final JwtUtil jwtUtil;

    public AuthController(
        RegisterService registerService,
        AuthenticationManager authenticationManager,
        CustomUserDetailsService customUserDetailsService,
        JwtUtil jwtUtil
    ) {
        this.registerService = registerService;
        this.authenticationManager = authenticationManager;
        this.customUserDetailsService = customUserDetailsService;
        this.jwtUtil = jwtUtil;
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

        AuthResponse response = new AuthResponse(
            token,
            userDetails.getAuthorities().iterator().next().getAuthority(),
            request.getEmail()
        );

        return ResponseEntity.ok(response);
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
