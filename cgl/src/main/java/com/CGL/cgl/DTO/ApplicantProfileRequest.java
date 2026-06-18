package com.CGL.cgl.DTO;

import com.CGL.cgl.Model.Gender;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ApplicantProfileRequest {
    private String nationalId;
    private LocalDate dateOfBirth;
    private Gender gender;
    private String county;
    private String educationalLevel;
    private Integer yearsOfExperience;
}
