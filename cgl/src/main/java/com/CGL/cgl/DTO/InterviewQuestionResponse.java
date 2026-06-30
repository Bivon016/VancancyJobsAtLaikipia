package com.CGL.cgl.DTO;

import com.CGL.cgl.Model.QuestionStatus;
import com.CGL.cgl.Model.QuestionType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InterviewQuestionResponse {

    private Long id;

    private Long interviewId;

    private String questionText;

    private QuestionType questionType;

    private List<String> options;

    private Boolean required;

    private Integer maxScore;

    private String createdByName;

    private LocalDateTime createdAt;

    private QuestionStatus status;

    private boolean answered;
}