package com.CGL.cgl.DTO;

import com.CGL.cgl.Model.AppointmentStatus;
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
public class FinalSelectionResponseDTO {

    private Long id;
    private Long applicationId;
    private String applicantName;
    private String applicantEmail;
    private String applicantNationalId;
    private String vacancyTitle;
    private String vacancyType;
    private String departmentName;
    private LocalDateTime approvalDate;
    private String remarks;
    private AppointmentStatus appointmentStatus;
}
