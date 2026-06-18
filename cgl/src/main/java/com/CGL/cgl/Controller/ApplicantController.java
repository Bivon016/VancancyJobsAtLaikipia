package com.CGL.cgl.Controller;

import com.CGL.cgl.DTO.ApplicantProfileRequest;
import com.CGL.cgl.Model.Applicant;
import com.CGL.cgl.Service.ApplicantService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/applicant")
public class ApplicantController {

    private final ApplicantService applicantService;
    public ApplicantController(ApplicantService applicantService) {
        this.applicantService = applicantService;
    }
    private String getCurrentUserEmail() {
        return SecurityContextHolder.getContext()
                .getAuthentication()
                .getName();
    }

    @PostMapping("/profile")
    @PreAuthorize("hasRole('APPLICANT')")
    public ResponseEntity<Applicant> createApplicant(@RequestBody ApplicantProfileRequest request) {
        String email = getCurrentUserEmail();
        return ResponseEntity.status(201).body(applicantService.createProfile(request,email));

    }
    @PutMapping("/profile")
    @PreAuthorize("hasRole('APPLICANT')")
    public ResponseEntity<Applicant> updateApplicant(@RequestBody ApplicantProfileRequest request) {
        String email = getCurrentUserEmail();
        return ResponseEntity.ok(applicantService.updateProfile(request, email));
    }

    @GetMapping("/profile")
    @PreAuthorize("hasRole('APPLICANT')")
    public ResponseEntity<Applicant> getApplicantProfile() {
        String email = getCurrentUserEmail();
        return ResponseEntity.ok(applicantService.getProfile(email));

    }



}
