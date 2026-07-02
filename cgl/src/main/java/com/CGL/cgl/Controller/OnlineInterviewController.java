package com.CGL.cgl.Controller;

import com.CGL.cgl.DTO.*;
import com.CGL.cgl.Model.OnlineInterviewStatus;
import com.CGL.cgl.Service.OnlineInterviewService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/online-interviews")
public class OnlineInterviewController {

    private final OnlineInterviewService onlineInterviewService;

    public OnlineInterviewController(OnlineInterviewService onlineInterviewService) {
        this.onlineInterviewService = onlineInterviewService;
    }

    @PostMapping
    @PreAuthorize("hasRole('HR_OFFICER') or hasRole('SUPER_ADMIN')")
    public ResponseEntity<OnlineInterviewResponse> createOnlineInterview(
            @RequestBody OnlineInterviewRequest request,
            Authentication authentication) {
        return ResponseEntity.ok(onlineInterviewService.createOnlineInterview(request, authentication.getName()));
    }

    @PostMapping("/vacancy/{vacancyId}")
    @PreAuthorize("hasRole('HR_OFFICER') or hasRole('SUPER_ADMIN')")
    public ResponseEntity<List<OnlineInterviewResponse>> createOnlineInterviewsForVacancy(
            @PathVariable Long vacancyId,
            @RequestBody OnlineInterviewWindowRequest windowTemplate,
            Authentication authentication) {
        return ResponseEntity.ok(onlineInterviewService
                .createOnlineInterviewsForVacancy(vacancyId, windowTemplate, authentication.getName()));
    }

    @PostMapping("/{token}/start")
    @PreAuthorize("hasRole('APPLICANT')")
    public ResponseEntity<OnlineInterviewResponse> startInterview(
            @PathVariable String token, Authentication authentication) {
        return ResponseEntity.ok(onlineInterviewService.startInterview(token, authentication.getName()));
    }

    @PostMapping("/{token}/submit")
    @PreAuthorize("hasRole('APPLICANT')")
    public ResponseEntity<OnlineInterviewResponse> submitInterview(
            @PathVariable String token, Authentication authentication) {
        return ResponseEntity.ok(onlineInterviewService.submitInterview(token, authentication.getName()));
    }

    @GetMapping("/token/{token}")
    @PreAuthorize("hasRole('APPLICANT')")
    public ResponseEntity<ApplicantInterviewResponse> getInterviewByToken(
            @PathVariable String token, Authentication authentication) {
        return ResponseEntity.ok(onlineInterviewService.getInterviewForApplicant(token, authentication.getName()));
    }

    @GetMapping
    @PreAuthorize("hasRole('HR_OFFICER') or hasRole('SUPER_ADMIN')")
    public ResponseEntity<List<OnlineInterviewResponse>> getInterviews(
            @RequestParam(required = false) Long vacancyId,
            @RequestParam(required = false) OnlineInterviewStatus status,
            Authentication authentication) {
        return ResponseEntity.ok(onlineInterviewService.getInterviews(vacancyId, status, authentication.getName()));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('HR_OFFICER') or hasRole('SUPER_ADMIN') or hasRole('PANEL_MEMBER')")
    public ResponseEntity<OnlineInterviewResponse> getInterviewById(
            @PathVariable Long id, Authentication authentication) {
        return ResponseEntity.ok(onlineInterviewService.getInterviewById(id, authentication.getName()));
    }

    @PatchMapping("/{id}/expire")
    @PreAuthorize("hasRole('HR_OFFICER') or hasRole('SUPER_ADMIN')")
    public ResponseEntity<OnlineInterviewResponse> expireInterview(
            @PathVariable Long id, Authentication authentication) {
        return ResponseEntity.ok(onlineInterviewService.expireInterview(id, authentication.getName()));
    }

    // Removed: GET /my — that's an applicant listing endpoint and belongs on a
    // different service (it uses ApplicantRepo/ApplicationsRepo directly, not
    // OnlineInterviewService). If you still need it, keep it as a separate
    // method — don't merge it into getInterviews above, since that one is
    // HR/Admin-only by design.
}