package com.CGL.cgl.DTO;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class SubmitScoreRequest {
    private Long applicantAnswerId;
    private Double marksAwarded;
    private String comment;
    private Boolean recommended;
}