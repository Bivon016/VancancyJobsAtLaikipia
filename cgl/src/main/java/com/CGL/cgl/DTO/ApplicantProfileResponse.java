package com.CGL.cgl.DTO;

import com.CGL.cgl.Model.Gender;
import com.CGL.cgl.Model.MaritalStatus;
import java.time.LocalDate;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ApplicantProfileResponse {

    private Long id;
    private Long userId;
    private String email;

    private String nationalId;
    private LocalDate birthDate;
    private Gender gender;
    private MaritalStatus maritalStatus;
    private String nationality;

    private String postalAddress;
    private String physicalAddress;

    private String countyOfBirth;
    private String countyOfResidence;
    private String subCounty;
    private String ward;
    private String village;

    private Boolean disabilityStatus;
    private String disabilityType;
    private String disabilityRegistrationNumber;
    private String ethnicity;

    private String educationalLevel;
    private Integer educationYearOfCompletion;
    private Integer yearsOfExperience;
    private String currentProfession;

    private Boolean profileCompleted;
    private LocalDateTime createdAt;
}
