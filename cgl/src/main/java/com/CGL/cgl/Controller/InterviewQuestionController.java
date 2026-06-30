package com.CGL.cgl.Controller;

import com.CGL.cgl.DTO.InterviewQuestionRequest;
import com.CGL.cgl.DTO.InterviewQuestionResponse;
import com.CGL.cgl.Model.QuestionStatus;
import com.CGL.cgl.Service.InterviewQuestionService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/interview-questions")
public class InterviewQuestionController {

    private final InterviewQuestionService interviewQuestionService;

    public InterviewQuestionController(InterviewQuestionService interviewQuestionService) {
        this.interviewQuestionService = interviewQuestionService;
    }

    @PostMapping
    @PreAuthorize("hasRole('PANEL_MEMBER')")
    public ResponseEntity<InterviewQuestionResponse> postQuestion(
            @RequestBody InterviewQuestionRequest request,
            Authentication authentication
    ) {
        String email = authentication.getName();
        InterviewQuestionResponse response = interviewQuestionService.postQuestion(request, email);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/interview/{interviewId}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','HR_OFFICER','APPLICANT','PANEL_MEMBER')")
    public ResponseEntity<List<InterviewQuestionResponse>> getQuestionsForInterview(
            @PathVariable Long interviewId,
            Authentication authentication
    ) {
        String email = authentication.getName();
        List<InterviewQuestionResponse> responses =
                interviewQuestionService.getQuestionsForInterview(interviewId, email);
        return ResponseEntity.ok(responses);
    }

    @PostMapping("/vacancy")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','HR_OFFICER','PANEL_MEMBER')")
    public ResponseEntity<InterviewQuestionResponse> postVacancyQuestion(
            @RequestBody InterviewQuestionRequest request,
            Authentication authentication
    ) {
        String email = authentication.getName();
        InterviewQuestionResponse response = interviewQuestionService.postQuestion(request, email);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/vacancy/batch")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','HR_OFFICER','PANEL_MEMBER')")
    public ResponseEntity<List<InterviewQuestionResponse>> postVacancyQuestionsBatch(
            @RequestBody List<InterviewQuestionRequest> requests,
            Authentication authentication
    ) {
        String email = authentication.getName();
        List<InterviewQuestionResponse> responses = interviewQuestionService.postQuestionsBatch(requests, email);
        return ResponseEntity.status(HttpStatus.CREATED).body(responses);
    }

    @GetMapping("/vacancy/{vacancyId}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','HR_OFFICER','PANEL_MEMBER')")
    public ResponseEntity<List<InterviewQuestionResponse>> getQuestionsForVacancy(
            @PathVariable Long vacancyId,
            Authentication authentication
    ) {
        String email = authentication.getName();
        List<InterviewQuestionResponse> responses = interviewQuestionService.getQuestionsForVacancy(vacancyId, email);
        return ResponseEntity.ok(responses);
    }

    @PatchMapping("/{questionId}/status")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','PANEL_MEMBER')")
    public ResponseEntity<InterviewQuestionResponse> updateQuestionStatus(
            @PathVariable Long questionId,
            @RequestParam QuestionStatus status,
            Authentication authentication
    ) {
        String email = authentication.getName();
        InterviewQuestionResponse response =
                interviewQuestionService.updateQuestionStatus(questionId, status, email);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{questionId}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','PANEL_MEMBER')")
    public ResponseEntity<Void> deleteQuestion(
            @PathVariable Long questionId,
            Authentication authentication
    ) {
        String email = authentication.getName();
        interviewQuestionService.deleteQuestion(questionId, email);
        return ResponseEntity.noContent().build();
    }
}