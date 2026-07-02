package com.CGL.cgl.Controller;

import com.CGL.cgl.DTO.ApplicantAnswerResponse;
import com.CGL.cgl.DTO.SubmitAnswerRequest;
import com.CGL.cgl.Service.ApplicantAnswerService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/applicant-answers")
public class ApplicantAnswerController {

    private final ApplicantAnswerService applicantAnswerService;

    public ApplicantAnswerController(ApplicantAnswerService applicantAnswerService) {
        this.applicantAnswerService = applicantAnswerService;
    }

    @PostMapping("/{token}")
    @PreAuthorize("hasRole('APPLICANT')")
    public ResponseEntity<ApplicantAnswerResponse> submitAnswer(
            @PathVariable String token,
            @RequestBody SubmitAnswerRequest request,
            Authentication authentication) {
        return ResponseEntity.ok(applicantAnswerService.submitAnswer(token, request, authentication.getName()));
    }

    @GetMapping("/{token}")
    @PreAuthorize("hasRole('APPLICANT')")
    public ResponseEntity<List<ApplicantAnswerResponse>> getMyAnswers(
            @PathVariable String token,
            Authentication authentication) {
        return ResponseEntity.ok(applicantAnswerService.getAnswersForInterview(token, authentication.getName()));
    }

    @GetMapping("/interview/{interviewId}/panel")
    @PreAuthorize("hasRole('PANEL_MEMBER') or hasRole('SUPER_ADMIN')")
    public ResponseEntity<List<ApplicantAnswerResponse>> getAnswersForPanel(
            @PathVariable Long interviewId, Authentication authentication) {
        return ResponseEntity.ok(applicantAnswerService.getAnswersForPanel(interviewId, authentication.getName()));
    }
}