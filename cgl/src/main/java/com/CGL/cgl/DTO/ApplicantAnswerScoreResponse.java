package com.CGL.cgl.DTO;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Getter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ApplicantAnswerScoreResponse {
    private Long id;
    private Long applicantAnswerId;
    private String panelMemberName;
    private Double marksAwarded;
    private Integer maxMarks;
    private String comment;
    private Boolean recommended;
    private LocalDateTime markedAt;
}