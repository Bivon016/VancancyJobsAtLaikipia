package com.CGL.cgl.Service;

import com.CGL.cgl.DTO.FinalSelectionRequest;
import com.CGL.cgl.Model.AppointmentStatus;
import com.CGL.cgl.Model.FinalSelection;

import java.util.List;

public interface FinalSelectionService {


    FinalSelection selectCandidate(
            FinalSelectionRequest request,
            String email
    );


    FinalSelection updateAppointmentStatus(
            Long selectionId,
            AppointmentStatus status,
            String email
    );


    List<FinalSelection> getSelectionsByVacancy(
            Long vacancyId
    );

}