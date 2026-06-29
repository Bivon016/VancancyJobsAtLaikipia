package com.CGL.cgl.DTO;

import com.CGL.cgl.Model.Gender;
import com.CGL.cgl.Model.MaritalStatus;
import java.time.LocalDate;
import java.time.LocalDateTime;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminApplicantDetailDTO {
    // Account fields
    private Long id;
    private String fName;
    private String lName;
    private String email;
    private String phoneNumber;
    private boolean emailVerified;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Profile fields (null if applicant hasn't completed their profile yet)
    private boolean profileCompleted;
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
}