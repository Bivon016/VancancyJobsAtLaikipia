package com.CGL.cgl.Service;

import com.CGL.cgl.DTO.CreateUserRequest;
import com.CGL.cgl.DTO.RegisterRequest;
import com.CGL.cgl.Model.Role;
import com.CGL.cgl.Model.Users;
import com.CGL.cgl.Repo.UserRepo;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class RegisterService {
    private final UserRepo  userRepo;
    private final BCryptPasswordEncoder passwordEncoder;

    public RegisterService(UserRepo userRepo, BCryptPasswordEncoder passwordEncoder) {
        this.userRepo = userRepo;
        this.passwordEncoder = passwordEncoder;
    }

    public Users createUser(RegisterRequest request) {
        Users user = Users.builder()
                .fName(request.getFName())
                .lName(request.getLName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(Role.APPLICANT)
                .phoneNumber(request.getPhoneNumber())
                .build();
        return userRepo.save(user);
    }

    public Users createSystemUser(CreateUserRequest request) {
        Users user = Users.builder()
                .fName(request.getFName())
                .lName(request.getLName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(request.getRole())  // role comes from admin, not hardcoded
                .phoneNumber(request.getPhoneNumber())
                .build();
        return userRepo.save(user);
    }
 }

