package com.CGL.cgl.DTO;

import com.CGL.cgl.Model.ApplicationStatus;
import com.CGL.cgl.Model.RecruitmentRequest;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class JobVacancyRequest {
    private Long id;
    private RecruitmentRequest recruitmentRequest;
    private ApplicationStatus status;
    private String createdBy;
    private LocalDateTime createdAt;
    private Long recruitmentRequestId;
    private String title;
    private String jobDescription;
    private String requirements;
    private String salaryScale;
    private Integer positionsAvailable;
    private LocalDate applicationDeadline;

}
