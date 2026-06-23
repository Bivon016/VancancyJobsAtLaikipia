package com.CGL.cgl.Service;

import com.CGL.cgl.DTO.FinalSelectionRequest;
import com.CGL.cgl.DTO.FinalSelectionResponseDTO;
import com.CGL.cgl.Model.AppointmentStatus;
import java.util.List;

public interface FinalSelectionService {
    FinalSelectionResponseDTO selectCandidate(
        FinalSelectionRequest request,
        String email
    );

    FinalSelectionResponseDTO updateAppointmentStatus(
        Long selectionId,
        AppointmentStatus status,
        String email
    );

    List<FinalSelectionResponseDTO> getSelectionsByVacancy(Long vacancyId);
}
