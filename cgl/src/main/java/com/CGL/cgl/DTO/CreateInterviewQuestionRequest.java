package com.CGL.cgl.DTO;

import com.CGL.cgl.Model.DifficultyLevel;
import com.CGL.cgl.Model.QuestionType;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class CreateInterviewQuestionRequest {
    private String questionText;
    private QuestionType questionType;
    private Integer defaultMarks;
    private String expectedAnswer;
    private String markingGuide;
    private DifficultyLevel difficultyLevel;
    private Boolean required;
    private List<QuestionOptionRequest> options; // required for MULTIPLE_CHOICE, CHECKBOX, TRUE_FALSE
}