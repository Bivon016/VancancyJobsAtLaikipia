package com.CGL.cgl.DTO;

import com.CGL.cgl.Model.QuestionType;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class AssessmentQuestionResponse {
    private Long id;
    private Long assessmentId;
    private String questionText;
    private QuestionType questionType;
    private Integer orderIndex;
}
