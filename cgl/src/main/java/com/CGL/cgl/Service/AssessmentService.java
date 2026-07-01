package com.CGL.cgl.Service;

import com.CGL.cgl.DTO.AssessmentAnswerRequest;
import com.CGL.cgl.DTO.AssessmentQuestionRequest;
import com.CGL.cgl.DTO.AssessmentQuestionResponse;
import com.CGL.cgl.DTO.AssessmentRequest;
import com.CGL.cgl.DTO.AssessmentResponseDTO;
import com.CGL.cgl.DTO.ApplicantResponseSummary;
import com.CGL.cgl.DTO.RecommendationRequest;
import com.CGL.cgl.DTO.RecommendationSummary;
import com.CGL.cgl.Model.Recommendation;
import java.util.List;

public interface AssessmentService {
    AssessmentResponseDTO createAssessment(AssessmentRequest request, String email);
    AssessmentQuestionResponse addQuestion(Long assessmentId, AssessmentQuestionRequest request, String email);
    void deleteQuestion(Long questionId, String email);
    AssessmentResponseDTO activateAssessment(Long assessmentId, String email);
    AssessmentResponseDTO closeAssessment(Long assessmentId, String email);
    List<AssessmentResponseDTO> getAvailableAssessmentsForApplicant(String email);
    List<AssessmentResponseDTO> getAllAssessments(String email);
    Object getAssessmentForApplicant(Long assessmentId, String email);
    void submitResponse(Long assessmentId, List<AssessmentAnswerRequest> answers, String email);
    List<ApplicantResponseSummary> getResponsesForAssessment(Long assessmentId, String email);
    void submitRecommendation(Long responseId, Recommendation recommendation, String email);
    RecommendationSummary getRecommendationSummary(Long vacancyId, String email);
}
