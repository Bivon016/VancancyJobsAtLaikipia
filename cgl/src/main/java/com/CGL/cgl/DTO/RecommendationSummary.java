package com.CGL.cgl.DTO;

import java.util.List;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class RecommendationSummary {
    private String vacancyTitle;
    private long totalShortlisted;
    private long totalSubmitted;
    private List<ApplicantResponseSummary> responses;
}
