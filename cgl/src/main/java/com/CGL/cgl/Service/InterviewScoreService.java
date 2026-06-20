package com.CGL.cgl.Service;

import com.CGL.cgl.DTO.InterviewScoreRequest;
import com.CGL.cgl.Model.InterviewScore;

import java.util.List;

public interface InterviewScoreService {

    InterviewScore submitScore(
            InterviewScoreRequest request,
            String email
    );

    List<InterviewScore> getInterviewScores(
            Long interviewId
    );

    Double getAverageScore(
            Long interviewId
    );
}