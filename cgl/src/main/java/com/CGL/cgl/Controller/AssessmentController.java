package com.CGL.cgl.Controller;

import com.CGL.cgl.DTO.AssessmentAnswerRequest;
import com.CGL.cgl.DTO.AssessmentQuestionRequest;
import com.CGL.cgl.DTO.AssessmentRequest;
import com.CGL.cgl.DTO.AssessmentResponseDTO;
import com.CGL.cgl.DTO.AssessmentQuestionResponse;
import com.CGL.cgl.DTO.ApplicantResponseSummary;
import com.CGL.cgl.DTO.RecommendationRequest;
import com.CGL.cgl.DTO.RecommendationSummary;
import com.CGL.cgl.Model.Recommendation;
import com.CGL.cgl.Service.AssessmentService;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/assessments")
public class AssessmentController {

    private final AssessmentService assessmentService;

    public AssessmentController(AssessmentService assessmentService) {

        this.assessmentService = assessmentService;
    }

    private String currentUserEmail() {

        return SecurityContextHolder.getContext().getAuthentication().getName();
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','HR_OFFICER')")
    public ResponseEntity<AssessmentResponseDTO> createAssessment(@RequestBody AssessmentRequest request) {
        return ResponseEntity.status(201).body(assessmentService.createAssessment(request, currentUserEmail()));
    }

    @PostMapping("/{assessmentId}/questions")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','HR_OFFICER','PANEL_MEMBER')")
    public ResponseEntity<AssessmentQuestionResponse> addQuestion(@PathVariable Long assessmentId, @RequestBody AssessmentQuestionRequest request) {
        return ResponseEntity.status(201).body(assessmentService.addQuestion(assessmentId, request, currentUserEmail()));
    }

    @DeleteMapping("/questions/{questionId}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','HR_OFFICER','PANEL_MEMBER')")
    public ResponseEntity<Void> deleteQuestion(@PathVariable Long questionId) {
        assessmentService.deleteQuestion(questionId, currentUserEmail());
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{assessmentId}/activate")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','HR_OFFICER')")
    public ResponseEntity<AssessmentResponseDTO> activateAssessment(@PathVariable Long assessmentId) {
        return ResponseEntity.ok(assessmentService.activateAssessment(assessmentId, currentUserEmail()));
    }

    @PutMapping("/{assessmentId}/close")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','HR_OFFICER')")
    public ResponseEntity<AssessmentResponseDTO> closeAssessment(@PathVariable Long assessmentId) {
        return ResponseEntity.ok(assessmentService.closeAssessment(assessmentId, currentUserEmail()));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','HR_OFFICER','PANEL_MEMBER')")
    public ResponseEntity<List<AssessmentResponseDTO>> getAllAssessments() {
        return ResponseEntity.ok(assessmentService.getAllAssessments(currentUserEmail()));
    }

    @GetMapping("/available")
    @PreAuthorize("hasRole('APPLICANT')")
    public ResponseEntity<List<AssessmentResponseDTO>> getAvailableAssessments() {
        return ResponseEntity.ok(assessmentService.getAvailableAssessmentsForApplicant(currentUserEmail()));
    }

    @GetMapping("/{assessmentId}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','HR_OFFICER','PANEL_MEMBER','APPLICANT')")
    public ResponseEntity<Object> getAssessment(@PathVariable Long assessmentId) {
        return ResponseEntity.ok(assessmentService.getAssessmentForApplicant(assessmentId, currentUserEmail()));
    }

    @PostMapping("/{assessmentId}/submit")
    @PreAuthorize("hasRole('APPLICANT')")
    public ResponseEntity<Void> submitResponse(@PathVariable Long assessmentId, @RequestBody List<AssessmentAnswerRequest> answers) {
        assessmentService.submitResponse(assessmentId, answers, currentUserEmail());
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{assessmentId}/responses")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','HR_OFFICER','PANEL_MEMBER')")
    public ResponseEntity<List<ApplicantResponseSummary>> getResponses(@PathVariable Long assessmentId) {
        return ResponseEntity.ok(assessmentService.getResponsesForAssessment(assessmentId, currentUserEmail()));
    }

    @PutMapping("/responses/{responseId}/recommendation")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','HR_OFFICER','PANEL_MEMBER')")
    public ResponseEntity<Void> submitRecommendation(@PathVariable Long responseId, @RequestBody RecommendationRequest request) {
        assessmentService.submitRecommendation(responseId, request.getRecommendation(), currentUserEmail());
        return ResponseEntity.ok().build();
    }

    @GetMapping("/vacancy/{vacancyId}/summary")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','HR_OFFICER')")
    public ResponseEntity<RecommendationSummary> getSummary(@PathVariable Long vacancyId) {
        return ResponseEntity.ok(assessmentService.getRecommendationSummary(vacancyId, currentUserEmail()));
    }
}
