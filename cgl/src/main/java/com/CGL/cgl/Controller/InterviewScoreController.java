package com.CGL.cgl.Controller;

import com.CGL.cgl.DTO.InterviewScoreRequest;
import com.CGL.cgl.Model.InterviewScore;
import com.CGL.cgl.Service.InterviewScoreService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/scores")
public class InterviewScoreController {

    private final InterviewScoreService interviewScoreService;

    public InterviewScoreController(
            InterviewScoreService interviewScoreService
    ) {
        this.interviewScoreService = interviewScoreService;
    }

    @PostMapping
    @PreAuthorize("hasRole('PANEL_MEMBER')")
    public ResponseEntity<InterviewScore> submitScore(

            @RequestBody InterviewScoreRequest request,

            Authentication authentication
    ) {

        String email = authentication.getName();

        return ResponseEntity.ok(
                interviewScoreService.submitScore(
                        request,
                        email
                )
        );
    }

    @GetMapping("/interview/{id}")
    @PreAuthorize(
            "hasAnyRole('HR_OFFICER','CPSB_ADMIN')"
    )
    public ResponseEntity<List<InterviewScore>>
    getInterviewScores(

            @PathVariable Long id
    ) {

        return ResponseEntity.ok(
                interviewScoreService
                        .getInterviewScores(id)
        );
    }

    @GetMapping("/interview/{id}/average")
    @PreAuthorize(
            "hasAnyRole('HR_OFFICER','CPSB_ADMIN')"
    )
    public ResponseEntity<Double>
    getAverageScore(

            @PathVariable Long id
    ) {

        return ResponseEntity.ok(
                interviewScoreService
                        .getAverageScore(id)
        );
    }
}