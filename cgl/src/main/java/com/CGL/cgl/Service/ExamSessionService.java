package com.CGL.cgl.Service;

import com.CGL.cgl.DTO.ExamStartResponse;
import com.CGL.cgl.DTO.InterviewAnswerRequest;
import com.CGL.cgl.DTO.InterviewAnswerResponse;

import java.util.List;

public interface ExamSessionService {

    ExamStartResponse startExam(Long interviewId, String email);

    List<InterviewAnswerResponse> autoSubmitRemaining(
            Long interviewId,
            List<InterviewAnswerRequest> answers,
            String email
    );
}