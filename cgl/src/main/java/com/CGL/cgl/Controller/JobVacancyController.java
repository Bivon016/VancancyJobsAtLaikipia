package com.CGL.cgl.Controller;

import com.CGL.cgl.DTO.JobVacancyRequest;
import com.CGL.cgl.Model.JobVacancy;
import com.CGL.cgl.Service.JobVacancyService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/jobs")
public class JobVacancyController {

    private final JobVacancyService jobVacancyService;

    public JobVacancyController(JobVacancyService jobVacancyService) {
        this.jobVacancyService = jobVacancyService;
    }

    private String getCurrentUserEmail() {
        return SecurityContextHolder.getContext()
                .getAuthentication()
                .getName();
    }

    @PostMapping
    @PreAuthorize("hasRole('CPSB_ADMIN')")
    public ResponseEntity<JobVacancy> createVacancy(@RequestBody JobVacancyRequest request) {
        String email = getCurrentUserEmail();
        return ResponseEntity.status(201).body(jobVacancyService.createVacancy(request, email));
    }

    @GetMapping("/allVacancies")
    public ResponseEntity<List<JobVacancy>> getAllVacancies() {
        return ResponseEntity.ok(jobVacancyService.getAllOpenVacancies());
    }

    @GetMapping("/{id}")
    public ResponseEntity<JobVacancy> getVacancyById(@PathVariable Long id) {
        return ResponseEntity.ok(jobVacancyService.getVacancyById(id));
    }

    @PutMapping("/{id}/close")
    @PreAuthorize("hasRole('CPSB_ADMIN')")
    public ResponseEntity<JobVacancy> closeVacancy(@PathVariable Long id) {
        return ResponseEntity.ok(jobVacancyService.closeVacancy(id));
    }
    @PutMapping("/{id}/open")
    @PreAuthorize("hasRole('CPSB_ADMIN')")
    public ResponseEntity<JobVacancy> openVacancy(@PathVariable Long id) {
        return ResponseEntity.ok(jobVacancyService.openVacancy(id));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<String> deleteVacancyById(@PathVariable Long id) {
        jobVacancyService.deleteVacancyById(id);
        return ResponseEntity.ok("Vacancy deleted successfully");
    }


}
