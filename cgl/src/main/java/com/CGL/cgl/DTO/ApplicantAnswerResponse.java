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
public class ApplicantAnswerResponse {
    private Long id;
    private Long questionSetItemId;
    private String questionText;
    private Integer maxMarks;
    private String answerText;
    private LocalDateTime answeredAt;
    private LocalDateTime lastEditedAt;
    private PanelScoreSummaryResponse myScore;
}