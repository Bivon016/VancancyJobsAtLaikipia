package com.CGL.cgl.Controller;

import com.CGL.cgl.DTO.*;
import com.CGL.cgl.Service.QuestionSetService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/question-sets")
public class QuestionSetController {

    private final QuestionSetService questionSetService;

    public QuestionSetController(QuestionSetService questionSetService) {
        this.questionSetService = questionSetService;
    }

    @PostMapping
    @PreAuthorize("hasRole('PANEL_MEMBER') or hasRole('SUPER_ADMIN')")
    public ResponseEntity<QuestionSetResponse> createQuestionSet(
            @RequestBody CreateQuestionSetRequest request,
            Authentication authentication) {
        return ResponseEntity.ok(questionSetService.createQuestionSet(request, authentication.getName()));
    }

    @PostMapping("/{id}/questions")
    @PreAuthorize("hasRole('PANEL_MEMBER') or hasRole('SUPER_ADMIN')")
    public ResponseEntity<QuestionSetResponse> addQuestion(
            @PathVariable Long id,
            @RequestBody AddQuestionToSetRequest request,
            Authentication authentication) {
        return ResponseEntity.ok(questionSetService.addQuestionToSet(id, request, authentication.getName()));
    }

    @DeleteMapping("/{id}/questions/{questionId}")
    @PreAuthorize("hasRole('PANEL_MEMBER') or hasRole('SUPER_ADMIN')")
    public ResponseEntity<QuestionSetResponse> removeQuestion(
            @PathVariable Long id,
            @PathVariable Long questionId,
            Authentication authentication) {
        return ResponseEntity.ok(questionSetService.removeQuestionFromSet(id, questionId, authentication.getName()));
    }

    @PatchMapping("/{id}/publish")
    @PreAuthorize("hasRole('PANEL_MEMBER') or hasRole('SUPER_ADMIN')")
    public ResponseEntity<QuestionSetResponse> publish(@PathVariable Long id, Authentication authentication) {
        return ResponseEntity.ok(questionSetService.publishQuestionSet(id, authentication.getName()));
    }

    @PatchMapping("/{id}/unpublish")
    @PreAuthorize("hasRole('PANEL_MEMBER') or hasRole('SUPER_ADMIN')")
    public ResponseEntity<QuestionSetResponse> unpublish(@PathVariable Long id, Authentication authentication) {
        return ResponseEntity.ok(questionSetService.unpublishQuestionSet(id, authentication.getName()));
    }

    @GetMapping
    @PreAuthorize("hasRole('PANEL_MEMBER') or hasRole('SUPER_ADMIN') or hasRole('HR_OFFICER')")
    public ResponseEntity<List<QuestionSetResponse>> getAll(Authentication authentication) {
        return ResponseEntity.ok(questionSetService.getAllQuestionSets(authentication.getName()));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('PANEL_MEMBER') or hasRole('SUPER_ADMIN') or hasRole('HR_OFFICER')")
    public ResponseEntity<QuestionSetResponse> getById(@PathVariable Long id, Authentication authentication) {
        return ResponseEntity.ok(questionSetService.getQuestionSetById(id, authentication.getName()));
    }

    @GetMapping("/vacancy/{vacancyId}")
    @PreAuthorize("hasRole('PANEL_MEMBER') or hasRole('SUPER_ADMIN') or hasRole('HR_OFFICER')")
    public ResponseEntity<List<QuestionSetResponse>> getByVacancy(
            @PathVariable Long vacancyId,
            Authentication authentication) {
        return ResponseEntity.ok(questionSetService.getQuestionSetsByVacancy(vacancyId, authentication.getName()));
    }
}