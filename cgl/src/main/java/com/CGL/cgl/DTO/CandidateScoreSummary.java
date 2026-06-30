package com.CGL.cgl.DTO;

import com.CGL.cgl.Model.InterviewStatus;

public record CandidateScoreSummary(
        Long applicationId,
        Long interviewId,
        String candidateName,
        String email,
        InterviewStatus interviewStatus,
        Long numberOfScores,
        Double avgTechnicalScore,
        Double avgCommunicationScore,
        Double avgExperienceScore,
        Double avgTotalScore
) {}