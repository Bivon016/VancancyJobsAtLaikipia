package com.CGL.cgl.DTO;

import com.CGL.cgl.Model.OnlineInterviewStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ApplicantInterviewResponse {
    private long id;
    private String vacancyTitle;
    private OnlineInterviewStatus status;
    private LocalDateTime opensAt;
    private LocalDateTime closesAt;
    private Integer durationMinutes;
    private LocalDateTime startedAt;
    private List<ApplicantInterviewQuestionResponse> questions;
}