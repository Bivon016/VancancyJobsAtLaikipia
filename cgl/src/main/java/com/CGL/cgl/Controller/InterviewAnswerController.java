package com.CGL.cgl.Controller;

import com.CGL.cgl.DTO.InterviewAnswerRequest;
import com.CGL.cgl.DTO.InterviewAnswerResponse;
import com.CGL.cgl.Service.InterviewAnswerService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/interview-answers")
public class InterviewAnswerController {

    private final InterviewAnswerService interviewAnswerService;

    public InterviewAnswerController(InterviewAnswerService interviewAnswerService) {
        this.interviewAnswerService = interviewAnswerService;
    }

    @PostMapping
    @PreAuthorize("hasRole('APPLICANT')")
    public ResponseEntity<InterviewAnswerResponse> submitAnswer(
            @RequestBody InterviewAnswerRequest request,
            Authentication authentication
    ) {
        String email = authentication.getName();
        InterviewAnswerResponse response = interviewAnswerService.submitAnswer(request, email);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/interview/{interviewId}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','HR_OFFICER','APPLICANT','PANEL_MEMBER')")
    public ResponseEntity<List<InterviewAnswerResponse>> getAnswersForInterview(
            @PathVariable Long interviewId,
            Authentication authentication
    ) {
        String email = authentication.getName();
        List<InterviewAnswerResponse> responses =
                interviewAnswerService.getAnswersForInterview(interviewId, email);
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/question/{questionId}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','HR_OFFICER','APPLICANT','PANEL_MEMBER')")
    public ResponseEntity<InterviewAnswerResponse> getAnswerForQuestion(
            @PathVariable Long questionId,
            Authentication authentication
    ) {
        String email = authentication.getName();
        InterviewAnswerResponse response =
                interviewAnswerService.getAnswerForQuestion(questionId, email);
        return ResponseEntity.ok(response);
    }
}