package com.CGL.cgl.DTO;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class AddQuestionToSetRequest {
    private Long questionId;
    private Integer orderIndex;  // optional — appended to end if null
    private Integer marks;       // optional — falls back to the question's defaultMarks if null
    private Boolean required;    // optional — defaults to true
}