package com.CGL.cgl.Service;

import com.CGL.cgl.DTO.InterviewAnswerRequest;
import com.CGL.cgl.DTO.InterviewAnswerResponse;
import com.CGL.cgl.Model.InterviewAnswer;
import com.CGL.cgl.Model.InterviewQuestion;
import com.CGL.cgl.Model.Users;

import java.util.List;

public interface InterviewAnswerService {

    InterviewAnswerResponse submitAnswer(InterviewAnswerRequest request, String email);

    List<InterviewAnswerResponse> getAnswersForInterview(Long interviewId, String email);

    InterviewAnswerResponse getAnswerForQuestion(Long questionId, String email);

    InterviewAnswer submitAnswerInternal(InterviewQuestion question, String answerText, Users applicant);

    InterviewAnswerResponse toResponsePublic(InterviewAnswer answer);
}