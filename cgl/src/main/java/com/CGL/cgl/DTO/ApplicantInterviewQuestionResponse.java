package com.CGL.cgl.DTO;

import com.CGL.cgl.Model.QuestionType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ApplicantInterviewQuestionResponse {
    private Long questionSetItemId;
    private Integer orderIndex;
    private Integer marks;
    private Boolean required;
    private String questionText;
    private QuestionType questionType;
}