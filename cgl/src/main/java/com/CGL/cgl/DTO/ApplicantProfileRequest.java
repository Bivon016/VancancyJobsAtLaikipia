package com.CGL.cgl.DTO;

import com.CGL.cgl.Model.Gender;
import com.CGL.cgl.Model.MaritalStatus;
import com.CGL.cgl.Validation.OnCreate;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Past;
import jakarta.validation.constraints.Pattern;
import java.time.LocalDate;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ApplicantProfileRequest {

    @NotBlank(groups = OnCreate.class, message = "National ID is required")
    @Pattern(regexp = "\\d{6,10}", message = "National ID must be 6-10 digits")
    private String nationalId;

    @NotNull(groups = OnCreate.class, message = "Birth date is required")
    @Past(message = "Birth date must be in the past")
    private LocalDate birthDate;

    @NotNull(groups = OnCreate.class, message = "Gender is required")
    private Gender gender;

    private MaritalStatus maritalStatus;

    @NotBlank(groups = OnCreate.class, message = "Nationality is required")
    private String nationality;

    private String postalAddress;

    @NotBlank(groups = OnCreate.class, message = "Physical address is required")
    private String physicalAddress;

    @NotBlank(groups = OnCreate.class, message = "County of birth is required")
    private String countyOfBirth;

    @NotBlank(
        groups = OnCreate.class,
        message = "County of residence is required"
    )
    private String countyOfResidence;

    private String subCounty;
    private String ward;
    private String village;

    private Boolean disabilityStatus;
    private String disabilityType;
    private String disabilityRegistrationNumber;
    private String ethnicity;

    @NotBlank(groups = OnCreate.class, message = "Education type is required")
    private String educationalLevel;

    @Min(value = 1950, message = "Education completion year seems invalid")
    @Max(value = 2100, message = "Education completion year seems invalid")
    private Integer educationYearOfCompletion;

    @Min(value = 0, message = "Years of experience cannot be negative")
    @Max(value = 60, message = "Years of experience seems invalid")
    private Integer yearsOfExperience;

    private String currentProfession;
}
