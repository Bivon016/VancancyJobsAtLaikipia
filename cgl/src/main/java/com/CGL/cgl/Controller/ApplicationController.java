package com.CGL.cgl.Controller;

import com.CGL.cgl.DTO.ApplicationsDTO;
import com.CGL.cgl.DTO.StatusUpdateRequestDTO;
import com.CGL.cgl.Model.Applications;
import com.CGL.cgl.Service.ApplicationService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/applications")
public class ApplicationController {

    private final ApplicationService applicationService;

    public ApplicationController(ApplicationService applicationService) {
        this.applicationService = applicationService;
    }
    private String getCurrentUserEmail() {
        return SecurityContextHolder.getContext()
                .getAuthentication()
                .getName();
    }

    @PostMapping("/apply")
    @PreAuthorize("hasRole('APPLICANT')")
    public ResponseEntity<Applications> applForJob(@RequestBody ApplicationsDTO request){
        String email = getCurrentUserEmail();
        return ResponseEntity.status(201).body(applicationService.applyForJob(request,email));
    }

    @GetMapping("/my")
    @PreAuthorize("hasRole('APPLICANT')")
    public ResponseEntity<List<Applications>> getMyApplications() {
        String email = getCurrentUserEmail();
        return ResponseEntity.ok(applicationService.getMyApplications(email));
    }

    @GetMapping("/vacancy/{vacancyId}")
    @PreAuthorize("hasAnyRole('CPSB_ADMIN','HR_OFFICER')")
    public ResponseEntity<List<Applications>> getAllApplicationsForVacancy(@PathVariable Long vacancyId) {
        return ResponseEntity.ok(applicationService.getAllApplicationsForVacancy(vacancyId));
    }

    @GetMapping("/all")
    @PreAuthorize("hasAnyRole('CPSB_ADMIN','HR_OFFICER')")
    public ResponseEntity<List<Applications>> getAllApplications(){
        return ResponseEntity.ok(applicationService.getAllApplications());
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('HR_OFFICER')")
    public ResponseEntity<Applications> updateStatus(
            @PathVariable Long id,
            @RequestBody StatusUpdateRequestDTO request) {
        return ResponseEntity.ok(
                applicationService.updateStatus(id, request.getStatus(), request.getRemarks())
        );
    }

}
