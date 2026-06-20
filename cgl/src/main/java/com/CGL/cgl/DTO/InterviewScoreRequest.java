package com.CGL.cgl.DTO;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class InterviewScoreRequest {

    private Long interviewId;

    private Double technicalScore;

    private Double communicationScore;

    private Double experienceScore;

    private String remarks;
}