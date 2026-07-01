package com.CGL.cgl.DTO;

import com.CGL.cgl.Model.QuestionType;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AssessmentQuestionRequest {
    private String questionText;
    private QuestionType questionType;
}
