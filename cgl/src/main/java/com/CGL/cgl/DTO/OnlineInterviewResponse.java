package com.CGL.cgl.DTO;

import com.CGL.cgl.Model.OnlineInterviewStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Getter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class OnlineInterviewResponse {
    private long id;
    private Long applicationId;
    private String applicantName;
    private String vacancyTitle;
    private String questionSetTitle;
    private OnlineInterviewStatus status;
    private LocalDateTime opensAt;
    private LocalDateTime closesAt;
    private Integer durationMinutes;
    private LocalDateTime startedAt;
    private LocalDateTime submittedAt;
    private String interviewToken;
    private LocalDateTime createdAt;
}