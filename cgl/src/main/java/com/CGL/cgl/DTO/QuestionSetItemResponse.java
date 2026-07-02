package com.CGL.cgl.DTO;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class QuestionSetItemResponse {
    private long itemId;
    private Integer orderIndex;
    private Integer marks;
    private Boolean required;
    private InterviewQuestionResponse question;
}