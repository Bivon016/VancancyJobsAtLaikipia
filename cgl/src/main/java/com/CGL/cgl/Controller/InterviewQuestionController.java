package com.CGL.cgl.Controller;

import com.CGL.cgl.DTO.CreateInterviewQuestionRequest;
import com.CGL.cgl.DTO.InterviewQuestionResponse;
import com.CGL.cgl.Service.InterviewQuestionService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/interview-questions")
public class InterviewQuestionController {

    private final InterviewQuestionService interviewQuestionService;

    public InterviewQuestionController(InterviewQuestionService interviewQuestionService) {
        this.interviewQuestionService = interviewQuestionService;
    }

    @PostMapping
    @PreAuthorize("hasRole('PANEL_MEMBER') or hasRole('SUPER_ADMIN')")
    public ResponseEntity<InterviewQuestionResponse> createQuestion(
            @RequestBody CreateInterviewQuestionRequest request,
            Authentication authentication) {
        return ResponseEntity.ok(interviewQuestionService.createQuestion(request, authentication.getName()));
    }

    @GetMapping
    @PreAuthorize("hasRole('PANEL_MEMBER') or hasRole('SUPER_ADMIN') or hasRole('HR_OFFICER')")
    public ResponseEntity<List<InterviewQuestionResponse>> getAllQuestions(Authentication authentication) {
        return ResponseEntity.ok(interviewQuestionService.getAllQuestions(authentication.getName()));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('PANEL_MEMBER') or hasRole('SUPER_ADMIN') or hasRole('HR_OFFICER')")
    public ResponseEntity<InterviewQuestionResponse> getQuestionById(
            @PathVariable Long id,
            Authentication authentication) {
        return ResponseEntity.ok(interviewQuestionService.getQuestionById(id, authentication.getName()));
    }
}