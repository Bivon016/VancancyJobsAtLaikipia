package com.CGL.cgl.DTO;

import com.CGL.cgl.Model.Status;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Setter
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class RecruitmentRequestDTO {

    private Long departmentId;
    private String jobTitle;
    private String jobDescription;
    private String keyDuties;
    private String academicQualifications;
    private String professionalQualifications;
    private String experience;
    private String technicalSkills;
    private String personalAttributes;
    private String competencies;
    private Integer numberOfPositions;
    private String reason;
    private Status status;
}
