package com.CGL.cgl.DTO;

import com.CGL.cgl.Model.Recommendation;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Getter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class OnlineInterviewResultResponse {
    private Long id;
    private Long onlineInterviewId;
    private Long applicationId;
    private String applicantName;
    private String vacancyTitle;
    private Double totalScore;
    private Double averageScore;
    private Boolean recommended;
    private Recommendation recommendation;
    private String panelRemarks;
    private String finalizedByName;
    private LocalDateTime finalizedAt;
}