package com.CGL.cgl.Controller;

import com.CGL.cgl.DTO.CandidateScoreSummary;
import com.CGL.cgl.DTO.InterviewRequest;
import com.CGL.cgl.DTO.PanelMemberRequest;
import com.CGL.cgl.Model.Interview;
import com.CGL.cgl.Model.InterviewStatus;
import com.CGL.cgl.Service.InterviewScoreService;
import com.CGL.cgl.Service.InterviewService;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/interviews")
public class InterviewController {

    private final InterviewService interviewService;
    private final InterviewScoreService interviewScoreService;

    public InterviewController(InterviewService interviewService, InterviewScoreService interviewScoreService) {
        this.interviewService = interviewService;
        this.interviewScoreService = interviewScoreService;
    }

    @PostMapping("/schedule")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','HR_OFFICER')")
    public ResponseEntity<Interview> scheduleInterview(
        @RequestBody InterviewRequest request,
        Authentication authentication
    ) {
        String email = authentication.getName();

        return ResponseEntity.ok(
            interviewService.scheduleInterview(request, email)
        );
    }

    @PostMapping("/panel")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','HR_OFFICER')")
    public ResponseEntity<String> addPanelMember(
        @RequestBody PanelMemberRequest request,
        Authentication authentication
    ) {
        String email = authentication.getName();

        interviewService.addPanelMember(request, email);

        return ResponseEntity.ok("Panel member added successfully");
    }

    @GetMapping("/my")
    @PreAuthorize("hasRole('PANEL_MEMBER')")
    public ResponseEntity<List<Interview>> getMyInterviews(
        Authentication authentication
    ) {
        String email = authentication.getName();

        return ResponseEntity.ok(interviewService.getMyInterviews(email));
    }

    @GetMapping("/status/{status}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','HR_OFFICER','CPSB_ADMIN')")
    public ResponseEntity<List<Interview>> getByStatus(
        @PathVariable InterviewStatus status
    ) {
        return ResponseEntity.ok(
            interviewService.getInterviewsByStatus(status)
        );
    }

    @PutMapping("/{id}/complete")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','HR_OFFICER','PANEL_MEMBER')")
    public ResponseEntity<Interview> completeInterview(
        @PathVariable Long id,
        Authentication authentication
    ) {
        String email = authentication.getName();

        return ResponseEntity.ok(interviewService.completeInterview(id, email));
    }

    @GetMapping("/vacancy/{vacancyId}")
    @PreAuthorize("hasAnyRole('HR_OFFICER','SUPER_ADMIN')")
    public ResponseEntity<List<CandidateScoreSummary>> getScoresByVacancy(
            @PathVariable Long vacancyId
    ) {
        return ResponseEntity.ok(interviewScoreService.getScoresByVacancy(vacancyId));
    }
}
