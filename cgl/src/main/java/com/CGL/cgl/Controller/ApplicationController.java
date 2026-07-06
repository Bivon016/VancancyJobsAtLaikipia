package com.CGL.cgl.Controller;

import com.CGL.cgl.DTO.ApplicationsDTO;
import com.CGL.cgl.DTO.StatusUpdateRequestDTO;
import com.CGL.cgl.Model.Applications;
import com.CGL.cgl.Service.ApplicationService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/applications")
public class ApplicationController {

    private final ApplicationService applicationService;

    public ApplicationController(ApplicationService applicationService) {
        this.applicationService = applicationService;
    }

    private String getCurrentUserEmail() {
        return SecurityContextHolder.getContext().getAuthentication().getName();
    }

    @PostMapping("/apply")
    @PreAuthorize("hasRole('APPLICANT')")
    public ResponseEntity<Applications> applForJob(
        @Valid @RequestBody ApplicationsDTO request
    ) {
        String email = getCurrentUserEmail();
        return ResponseEntity.status(201).body(
            applicationService.applyForJob(request, email)
        );
    }

    @GetMapping("/my")
    @PreAuthorize("hasRole('APPLICANT')")
    public ResponseEntity<List<Applications>> getMyApplications() {
        String email = getCurrentUserEmail();
        return ResponseEntity.ok(applicationService.getMyApplications(email));
    }

    @GetMapping("/vacancy/{vacancyId}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','CPSB_ADMIN','HR_OFFICER')")
    public ResponseEntity<List<Applications>> getAllApplicationsForVacancy(
        @PathVariable Long vacancyId,
        @RequestParam(defaultValue = "false") boolean includeClosed
    ) {
        return ResponseEntity.ok(
            applicationService.getAllApplicationsForVacancy(vacancyId, includeClosed)
        );
    }

    @GetMapping("/all")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','CPSB_ADMIN','HR_OFFICER')")
    public ResponseEntity<List<Applications>> getAllApplications(
        @RequestParam(defaultValue = "false") boolean includeClosed
    ) {
        return ResponseEntity.ok(applicationService.getAllApplications(includeClosed));
    }

    @GetMapping("/closed")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','CPSB_ADMIN','HR_OFFICER')")
    public ResponseEntity<List<Applications>> getClosedApplications() {
        return ResponseEntity.ok(applicationService.getClosedApplications());
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('HR_OFFICER')")
    public ResponseEntity<Applications> updateStatus(
        @PathVariable Long id,
        @RequestBody StatusUpdateRequestDTO request
    ) {
        return ResponseEntity.ok(
            applicationService.updateStatus(
                id,
                request.getStatus(),
                request.getRemarks()
            )
        );
    }

    @PutMapping("/{id}/mark-done")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','HR_OFFICER')")
    public ResponseEntity<Applications> markApplicationDone(@PathVariable Long id) {
        return ResponseEntity.ok(
            applicationService.markApplicationDone(id, getCurrentUserEmail())
        );
    }

    @PutMapping("/{id}/reopen")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','HR_OFFICER')")
    public ResponseEntity<Applications> reopenApplication(@PathVariable Long id) {
        return ResponseEntity.ok(
            applicationService.reopenApplication(id, getCurrentUserEmail())
        );
    }
}
