package com.CGL.cgl.Controller;

import com.CGL.cgl.DTO.AdminUserOptionDTO;
import com.CGL.cgl.DTO.CreateUserRequest;
import com.CGL.cgl.Model.Role;
import com.CGL.cgl.Model.Users;
import com.CGL.cgl.Repo.UserRepo;
import com.CGL.cgl.Service.RegisterService;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/admin")
public class AdminController {

    private final RegisterService registerService;
    private final UserRepo userRepo;

    public AdminController(RegisterService registerService, UserRepo userRepo) {
        this.registerService = registerService;
        this.userRepo = userRepo;
    }

    @PostMapping("/users/create")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<String> CreateUsers(
        @RequestBody CreateUserRequest createUserRequest
    ) {
        registerService.createSystemUser(createUserRequest);
        return ResponseEntity.status(201).body("User registered successfully");
    }

    @GetMapping("/users")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','HR_OFFICER','CPSB_ADMIN')")
    public ResponseEntity<List<AdminUserOptionDTO>> getUsers(
        @RequestParam(required = false) List<Role> roles
    ) {
        List<Users> users =
            roles == null || roles.isEmpty()
                ? userRepo.findAllByOrderByFNameAscLNameAsc()
                : userRepo.findByRoleInOrderByFNameAscLNameAsc(roles);

        List<AdminUserOptionDTO> response = users
            .stream()
            .map(this::toUserOption)
            .toList();

        return ResponseEntity.ok(response);
    }

    private AdminUserOptionDTO toUserOption(Users user) {
        return AdminUserOptionDTO.builder()
            .id(user.getId())
            .fName(user.getFName())
            .lName(user.getLName())
            .email(user.getEmail())
            .phoneNumber(user.getPhoneNumber())
            .role(user.getRole())
            .build();
    }
}
