package com.CGL.cgl.Controller;

import com.CGL.cgl.DTO.CreateUserRequest;
import com.CGL.cgl.Service.RegisterService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/admin")
public class AdminController {

    private final RegisterService registerService;
    public AdminController(RegisterService registerService) {
        this.registerService = registerService;
    }

    @PostMapping("/users/create")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<String> CreateUsers(@RequestBody CreateUserRequest createUserRequest) {
        registerService.createSystemUser(createUserRequest);
        return ResponseEntity.status(201).body("User registered successfully");}
}
