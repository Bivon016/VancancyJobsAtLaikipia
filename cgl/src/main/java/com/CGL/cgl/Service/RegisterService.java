package com.CGL.cgl.Service;

import com.CGL.cgl.DTO.CreateUserRequest;
import com.CGL.cgl.DTO.RegisterRequest;
import com.CGL.cgl.Exception.ConflictException;
import com.CGL.cgl.Model.Role;
import com.CGL.cgl.Model.Users;
import com.CGL.cgl.Repo.UserRepo;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class RegisterService {

    private final UserRepo userRepo;
    private final BCryptPasswordEncoder passwordEncoder;
    private final EmailVerificationService emailVerificationService;

    public RegisterService(
        UserRepo userRepo,
        BCryptPasswordEncoder passwordEncoder,
        EmailVerificationService emailVerificationService
    ) {
        this.userRepo = userRepo;
        this.passwordEncoder = passwordEncoder;
        this.emailVerificationService = emailVerificationService;
    }

    @Transactional
    public Users createUser(RegisterRequest request) {
        if (userRepo.findByEmail(request.getEmail()).isPresent()) {
            throw new ConflictException("Email already registered");
        }

        Users user = Users.builder()
            .fName(request.getFName())
            .lName(request.getLName())
            .email(request.getEmail())
            .password(passwordEncoder.encode(request.getPassword()))
            .role(Role.APPLICANT)
            .phoneNumber(request.getPhoneNumber())
            .emailVerified(false)
            .build();
        Users savedUser = userRepo.save(user);
        emailVerificationService.sendVerificationEmail(savedUser);
        return savedUser;
    }

    public Users createSystemUser(CreateUserRequest request) {
        if (userRepo.findByEmail(request.getEmail()).isPresent()) {
            throw new ConflictException("Email already registered");
        }

        Users user = Users.builder()
            .fName(request.getFName())
            .lName(request.getLName())
            .email(request.getEmail())
            .password(passwordEncoder.encode(request.getPassword()))
            .role(request.getRole())
            .phoneNumber(request.getPhoneNumber())
            .emailVerified(false)
            .mustChangePassword(true)
            .build();
        Users savedUser = userRepo.save(user);
        emailVerificationService.sendVerificationEmail(savedUser);
        return savedUser;
    }
}
