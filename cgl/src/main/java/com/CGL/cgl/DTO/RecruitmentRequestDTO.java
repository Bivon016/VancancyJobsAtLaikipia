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
    private String requirements;
    private Integer numberOfPositions;
    private String reason;
    private Status status;
}
