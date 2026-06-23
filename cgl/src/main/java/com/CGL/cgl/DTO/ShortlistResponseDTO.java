package com.CGL.cgl.DTO;

import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ShortlistResponseDTO {

    private Long id;
    private Long applicationId;
    private String applicantName;
    private String applicantEmail;
    private String applicantNationalId;
    private String educationalLevel;
    private Integer yearsOfExperience;
    private String vacancyTitle;
    private String vacancyType;
    private String departmentName;
    private LocalDateTime shortlistedDate;
    private String remarks;
}
