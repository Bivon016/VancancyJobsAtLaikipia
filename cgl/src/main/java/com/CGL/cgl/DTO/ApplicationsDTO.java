package com.CGL.cgl.DTO;

import jakarta.validation.Valid;
import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ApplicationsDTO {

    @NotNull(message = "Vacancy is required")
    private Long vacancyId;

    @NotBlank(message = "Suitability statement is required")
    @Size(
        min = 20,
        max = 4000,
        message = "Suitability statement must be between 20 and 4000 characters"
    )
    private String suitabilityStatement;

    @AssertTrue(
        message = "You must confirm that the information provided is true"
    )
    private boolean declareInformationTrue;

    @AssertTrue(message = "You must agree to verification of your information")
    private boolean declareAvailabilityForVerification;

    @AssertTrue(
        message = "You must confirm that you have no conflict of interest"
    )
    private boolean declareNoConflictOfInterest;

    @AssertTrue(
        message = "You must confirm that you have no undisclosed criminal conviction"
    )
    private boolean declareNoCriminalConviction;

    @AssertTrue(
        message = "You must consent to processing of your application data"
    )
    private boolean consentToDataProcessing;

    @AssertTrue(
        message = "You must confirm that your supporting documents are ready"
    )
    private boolean documentsReadyConfirmed;

    @NotNull(message = "Referees are required")
    @Valid
    @Size(min = 2, max = 3, message = "Provide between 2 and 3 referees")
    private List<ApplicationRefereeDTO> referees;
}
