package com.CGL.cgl.DTO;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class PanelScoreSummaryResponse {
    private Long scoreId;
    private Double marksAwarded;
    private String comment;
    private Boolean recommended;
}