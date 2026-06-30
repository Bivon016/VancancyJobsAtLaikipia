package com.CGL.cgl.DTO;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExamStartResponse {

    private Long interviewId;

    private LocalDateTime examStartedAt;

    private LocalDateTime deadline;

    private Integer durationMinutes;
}