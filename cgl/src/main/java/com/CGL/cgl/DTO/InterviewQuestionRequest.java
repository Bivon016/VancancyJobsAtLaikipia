package com.CGL.cgl.DTO;

import com.CGL.cgl.Model.QuestionType;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class InterviewQuestionRequest {

    private Long interviewId;

    private Long vacancyId;

    private String questionText;

    private QuestionType questionType;

    private List<String> options;

    private Boolean required;

    private String correctAnswer;

    private String modelAnswer;

    private String markingRubric;

    private Integer maxScore;
}