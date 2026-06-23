package com.CGL.cgl.DTO;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ApplicationRefereeDTO {

    @NotBlank(message = "Referee name is required")
    @Size(max = 150, message = "Referee name is too long")
    private String fullName;

    @NotBlank(message = "Referee designation is required")
    @Size(max = 150, message = "Referee designation is too long")
    private String designation;

    @NotBlank(message = "Referee organization is required")
    @Size(max = 150, message = "Referee organization is too long")
    private String organization;

    @NotBlank(message = "Referee phone number is required")
    @Pattern(regexp = "^[+0-9][0-9\\s-]{8,19}$", message = "Referee phone number is invalid")
    private String phoneNumber;

    @NotBlank(message = "Referee email is required")
    @Email(message = "Referee email is invalid")
    private String email;

    @NotBlank(message = "Relationship to referee is required")
    @Size(max = 120, message = "Referee relationship is too long")
    private String relationship;
}
