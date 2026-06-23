package com.CGL.cgl.Controller;

import com.CGL.cgl.DTO.FinalSelectionRequest;
import com.CGL.cgl.DTO.FinalSelectionResponseDTO;
import com.CGL.cgl.Model.AppointmentStatus;
import com.CGL.cgl.Service.FinalSelectionService;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

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
    public ResponseEntity<FinalSelectionResponseDTO> selectCandidate(
        @RequestBody FinalSelectionRequest request
    ) {
        String email = SecurityContextHolder.getContext()
            .getAuthentication()
            .getName();

        FinalSelectionResponseDTO selection =
            finalSelectionService.selectCandidate(request, email);

        return ResponseEntity.ok(selection);
    }

    @PutMapping("/{id}/appoint")
    @PreAuthorize("hasRole('CPSB_ADMIN')")
    public ResponseEntity<FinalSelectionResponseDTO> updateAppointmentStatus(
        @PathVariable Long id,
        @RequestParam AppointmentStatus status
    ) {
        String email = SecurityContextHolder.getContext()
            .getAuthentication()
            .getName();

        FinalSelectionResponseDTO selection =
            finalSelectionService.updateAppointmentStatus(id, status, email);

        return ResponseEntity.ok(selection);
    }

    @GetMapping("/vacancy/{vacancyId}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','CPSB_ADMIN','HR_OFFICER')")
    public ResponseEntity<
        List<FinalSelectionResponseDTO>
    > getSelectionsByVacancy(@PathVariable Long vacancyId) {
        return ResponseEntity.ok(
            finalSelectionService.getSelectionsByVacancy(vacancyId)
        );
    }
}
