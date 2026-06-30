package com.CGL.cgl.DTO;

import com.CGL.cgl.Model.ScoreStatus;
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
public class InterviewAnswerResponse {

    private Long id;

    private Long questionId;

    private String questionText;

    private Long interviewId;

    private String applicantName;

    private String answerText;

    private LocalDateTime submittedAt;

    private Integer score;

    private String feedback;

    private ScoreStatus scoreStatus;
}