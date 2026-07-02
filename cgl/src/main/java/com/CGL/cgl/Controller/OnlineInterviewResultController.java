package com.CGL.cgl.Controller;

import com.CGL.cgl.DTO.FinalizeResultRequest;
import com.CGL.cgl.DTO.OnlineInterviewResultResponse;
import com.CGL.cgl.Model.Recommendation;
import com.CGL.cgl.Service.OnlineInterviewResultService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/online-interview-results")
public class OnlineInterviewResultController {

    private final OnlineInterviewResultService resultService;

    public OnlineInterviewResultController(OnlineInterviewResultService resultService) {
        this.resultService = resultService;
    }

    @PostMapping("/{interviewId}/finalize")
    @PreAuthorize("hasRole('PANEL_MEMBER') or hasRole('SUPER_ADMIN')")
    public ResponseEntity<OnlineInterviewResultResponse> finalizeResult(
            @PathVariable Long interviewId,
            @RequestBody FinalizeResultRequest request,
            Authentication authentication) {
        return ResponseEntity.ok(resultService.finalizeResult(interviewId, request, authentication.getName()));
    }

    @GetMapping("/{interviewId}")
    @PreAuthorize("hasRole('PANEL_MEMBER') or hasRole('SUPER_ADMIN') or hasRole('HR_OFFICER')")
    public ResponseEntity<OnlineInterviewResultResponse> getResult(@PathVariable Long interviewId) {
        return ResponseEntity.ok(resultService.getResult(interviewId));
    }

    @GetMapping("/vacancy/{vacancyId}")
    @PreAuthorize("hasRole('HR_OFFICER') or hasRole('SUPER_ADMIN')")
    public ResponseEntity<List<OnlineInterviewResultResponse>> getResultsForVacancy(
            @PathVariable Long vacancyId,
            @RequestParam(required = false) Recommendation recommendation,
            Authentication authentication) {
        return ResponseEntity.ok(resultService.getResultsForVacancy(vacancyId, recommendation, authentication.getName()));
    }

    @GetMapping
    @PreAuthorize("hasRole('HR_OFFICER') or hasRole('SUPER_ADMIN')")
    public ResponseEntity<List<OnlineInterviewResultResponse>> getAllResults(Authentication authentication) {
        return ResponseEntity.ok(resultService.getAllResults(authentication.getName()));
    }
}