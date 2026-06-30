package com.CGL.cgl.Service;

import com.CGL.cgl.DTO.InterviewQuestionRequest;
import com.CGL.cgl.DTO.InterviewQuestionResponse;
import com.CGL.cgl.Model.QuestionStatus;

import java.util.List;

public interface InterviewQuestionService {

    InterviewQuestionResponse postQuestion(InterviewQuestionRequest request, String email);

    List<InterviewQuestionResponse> postQuestionsBatch(List<InterviewQuestionRequest> requests, String email);

    List<InterviewQuestionResponse> getQuestionsForInterview(Long interviewId, String email);

    List<InterviewQuestionResponse> getQuestionsForVacancy(Long vacancyId, String email);

    InterviewQuestionResponse updateQuestionStatus(Long questionId, QuestionStatus status, String email);

    void deleteQuestion(Long questionId, String email);
}