package com.CGL.cgl.Controller;

import com.CGL.cgl.DTO.RecruitmentRequestDTO;
import com.CGL.cgl.Model.RecruitmentRequest;
import com.CGL.cgl.Service.RecruuitmentRequestService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/recruitment")
public class RecruitmentController {

    private final RecruuitmentRequestService service;

    public RecruitmentController(RecruuitmentRequestService service) {
        this.service = service;
    }

    private String getCurrentUserEmail() {
        return SecurityContextHolder.getContext()
                .getAuthentication()
                .getName();
    }

    @PostMapping("/submit")
    @PreAuthorize("hasRole('DEPT_HEAD')")
    public ResponseEntity<RecruitmentRequest> submit(
            @RequestBody RecruitmentRequestDTO request) {

        String email = getCurrentUserEmail();

        return ResponseEntity.status(201)
                .body(service.submitRequest(request, email));
    }
    @PutMapping("/{id}/approve")
    @PreAuthorize("hasRole('CPSB_ADMIN')")
    public ResponseEntity<RecruitmentRequest> approveRequest(
            @PathVariable Long id) {

        String email = getCurrentUserEmail();

        return ResponseEntity.ok(
                service.approveRequest(id, email)
        );
    }

    @PutMapping("/{id}/reject")
    @PreAuthorize("hasRole('CPSB_ADMIN')")
    public ResponseEntity<RecruitmentRequest> rejectRequest(
            @PathVariable Long id) {

        String email = getCurrentUserEmail();

        return ResponseEntity.ok(
                service.rejectRequest(id, email)
        );
    }

    @GetMapping("/pending")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','CPSB_ADMIN')")
    public ResponseEntity<List<RecruitmentRequest>> getPendingRequests() {

        return ResponseEntity.ok(
                service.getPendingRequests()
        );
    }

    @GetMapping("/all")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','CPSB_ADMIN')")
    public ResponseEntity<List<RecruitmentRequest>> getAllRequests() {

        return ResponseEntity.ok(
                service.getAllRequests()
        );
    }

    @GetMapping("/department/{departmentId}")
    @PreAuthorize("hasAnyRole('DEPT_HEAD','CPSB_ADMIN')")
    public ResponseEntity<List<RecruitmentRequest>> getRequestsByDepartment(
            @PathVariable Long departmentId) {

        return ResponseEntity.ok(
                service.getRequestsByDepartment(departmentId)
        );
    }
}