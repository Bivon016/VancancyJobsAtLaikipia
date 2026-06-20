package com.CGL.cgl.Controller;

import com.CGL.cgl.Model.AppointmentStatus;
import com.CGL.cgl.Model.FinalSelection;
import com.CGL.cgl.DTO.FinalSelectionRequest;
import com.CGL.cgl.Service.FinalSelectionService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;


@RestController
@RequestMapping("/selections")
public class FinalSelectionController {


    private final FinalSelectionService finalSelectionService;


    public FinalSelectionController(
            FinalSelectionService finalSelectionService
    ) {
        this.finalSelectionService = finalSelectionService;
    }



    @PostMapping
    @PreAuthorize("hasRole('CPSB_ADMIN')")
    public ResponseEntity<FinalSelection> selectCandidate(
            @RequestBody FinalSelectionRequest request
    ) {


        String email =
                SecurityContextHolder
                        .getContext()
                        .getAuthentication()
                        .getName();


        FinalSelection selection =
                finalSelectionService.selectCandidate(
                        request,
                        email
                );


        return ResponseEntity.ok(selection);

    }

    @PutMapping("/{id}/appoint")
    @PreAuthorize("hasRole('CPSB_ADMIN')")
    public ResponseEntity<FinalSelection> updateAppointmentStatus(
            @PathVariable Long id,
            @RequestParam AppointmentStatus status
    ) {


        String email =
                SecurityContextHolder
                        .getContext()
                        .getAuthentication()
                        .getName();


        FinalSelection selection =
                finalSelectionService.updateAppointmentStatus(
                        id,
                        status,
                        email
                );


        return ResponseEntity.ok(selection);

    }





    @GetMapping("/vacancy/{vacancyId}")
    @PreAuthorize("hasAnyRole('CPSB_ADMIN','HR_OFFICER')")
    public ResponseEntity<List<FinalSelection>> getSelectionsByVacancy(
            @PathVariable Long vacancyId
    ) {


        return ResponseEntity.ok(
                finalSelectionService.getSelectionsByVacancy(
                        vacancyId
                )
        );

    }

}