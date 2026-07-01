package com.CGL.cgl.DTO;

import com.CGL.cgl.Model.AssessmentStatus;
import java.time.LocalDateTime;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class AssessmentResponseDTO {
    private Long id;
    private Long vacancyId;
    private String vacancyTitle;
    private String title;
    private String instructions;
    private AssessmentStatus status;
    private String createdByName;
    private LocalDateTime createdAt;
    private int questionCount;
    private long submissionCount;
}
