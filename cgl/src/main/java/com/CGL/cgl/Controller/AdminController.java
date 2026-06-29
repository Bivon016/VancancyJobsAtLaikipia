package com.CGL.cgl.Controller;

import com.CGL.cgl.DTO.*;
import com.CGL.cgl.Model.Applicant;
import com.CGL.cgl.Model.Role;
import com.CGL.cgl.Model.Users;
import com.CGL.cgl.Repo.ApplicantRepo;
import com.CGL.cgl.Repo.UserRepo;
import com.CGL.cgl.Service.AdminService;
import com.CGL.cgl.Service.RegisterService;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/admin")
public class AdminController {

    private final RegisterService registerService;
    private final UserRepo userRepo;
    private final AdminService adminService;
    private final PasswordEncoder passwordEncoder;
    private final ApplicantRepo applicantRepo;

    public AdminController(
            RegisterService registerService,
            UserRepo userRepo,
            AdminService adminService,
            PasswordEncoder passwordEncoder,
            ApplicantRepo applicantRepo
    ) {
        this.registerService = registerService;
        this.userRepo = userRepo;
        this.adminService = adminService;
        this.passwordEncoder = passwordEncoder;
        this.applicantRepo = applicantRepo;
    }

    @GetMapping("/applicants/{id}")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<AdminApplicantDetailDTO> getApplicantDetail(@PathVariable Long id) {
        Users user = userRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getRole() != Role.APPLICANT) {
            throw new RuntimeException("This user is not an applicant");
        }

        Applicant profile = applicantRepo.findByUser_Id(id).orElse(null);
        return ResponseEntity.ok(toApplicantDetail(user, profile));
    }

    private AdminApplicantDetailDTO toApplicantDetail(Users user, Applicant profile) {
        AdminApplicantDetailDTO.AdminApplicantDetailDTOBuilder builder = AdminApplicantDetailDTO.builder()
                .id(user.getId())
                .fName(user.getFName())
                .lName(user.getLName())
                .email(user.getEmail())
                .phoneNumber(user.getPhoneNumber())
                .emailVerified(user.isEmailVerified())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .profileCompleted(profile != null && Boolean.TRUE.equals(profile.getProfileCompleted()));

        if (profile != null) {
            builder
                    .nationalId(profile.getNationalId())
                    .birthDate(profile.getBirthDate())
                    .gender(profile.getGender())
                    .maritalStatus(profile.getMaritalStatus())
                    .nationality(profile.getNationality())
                    .postalAddress(profile.getPostalAddress())
                    .physicalAddress(profile.getPhysicalAddress())
                    .countyOfBirth(profile.getCountyOfBirth())
                    .countyOfResidence(profile.getCountyOfResidence())
                    .subCounty(profile.getSubCounty())
                    .ward(profile.getWard())
                    .village(profile.getVillage())
                    .disabilityStatus(profile.getDisabilityStatus())
                    .disabilityType(profile.getDisabilityType())
                    .disabilityRegistrationNumber(profile.getDisabilityRegistrationNumber())
                    .ethnicity(profile.getEthnicity())
                    .educationalLevel(profile.getEducationalLevel())
                    .educationYearOfCompletion(profile.getEducationYearOfCompletion())
                    .yearsOfExperience(profile.getYearsOfExperience())
                    .currentProfession(profile.getCurrentProfession());
        }

        return builder.build();
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
                        ? userRepo.findAllOrderByName()
                        : userRepo.findByRoleInOrderByName(roles);

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

    @PutMapping("/users/{id}/role")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<AdminUserOptionDTO> updateUserRole(
            @PathVariable Long id,
            @RequestParam Role role
    ) {
        Users user = userRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setRole(role);
        userRepo.save(user);
        return ResponseEntity.ok(toUserOption(user));
    }

    @GetMapping("/users/{id}")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<AdminUserDetailDTO> getUserDetail(@PathVariable Long id) {
        Users user = userRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return ResponseEntity.ok(toUserDetail(user));
    }

    @DeleteMapping("/users/{id}")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<String> deleteUser(@PathVariable Long id) {
        adminService.deleteUser(id);
        return ResponseEntity.ok("User deleted successfully");
    }

    @DeleteMapping("/users/{id}/reassign-and-delete")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<String> reassignAndDeleteDeptHead(
            @PathVariable Long id,
            @RequestParam Long newHeadId
    ) {
        adminService.reassignAndDeleteDeptHead(id, newHeadId);
        return ResponseEntity.ok("Department reassigned and user deleted");
    }

    @PutMapping("/users/{id}")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<AdminUserDetailDTO> updateUser(
            @PathVariable Long id,
            @RequestBody AdminUpdateUserRequest request
    ) {
        Users user = userRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (request.getEmail() != null && !request.getEmail().isBlank()
                && !request.getEmail().equalsIgnoreCase(user.getEmail())) {
            userRepo.findByEmail(request.getEmail()).ifPresent(existing -> {
                if (!existing.getId().equals(id)) {
                    throw new RuntimeException("Email is already in use by another account");
                }
            });
            user.setEmail(request.getEmail());
        }

        if (request.getFName() != null && !request.getFName().isBlank()) {
            user.setFName(request.getFName());
        }
        if (request.getLName() != null && !request.getLName().isBlank()) {
            user.setLName(request.getLName());
        }
        if (request.getPassword() != null && !request.getPassword().isBlank()) {
            user.setPassword(passwordEncoder.encode(request.getPassword()));
        }

        userRepo.save(user);
        return ResponseEntity.ok(toUserDetail(user));
    }

    private AdminUserDetailDTO toUserDetail(Users user) {
        return AdminUserDetailDTO.builder()
                .id(user.getId())
                .fName(user.getFName())
                .lName(user.getLName())
                .email(user.getEmail())
                .phoneNumber(user.getPhoneNumber())
                .role(user.getRole())
                .emailVerified(user.isEmailVerified())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .build();
    }


}