package com.CGL.cgl.Controller;

import com.CGL.cgl.DTO.ApplicantAnswerScoreResponse;
import com.CGL.cgl.DTO.SubmitScoreRequest;
import com.CGL.cgl.Model.OnlineInterview;
import com.CGL.cgl.Repo.OnlineInterviewRepo;
import com.CGL.cgl.Service.ApplicantAnswerScoreService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/answer-scores")
public class ApplicantAnswerScoreController {

    private final ApplicantAnswerScoreService scoreService;
    private final OnlineInterviewRepo onlineInterviewRepo;

    public ApplicantAnswerScoreController(ApplicantAnswerScoreService scoreService, OnlineInterviewRepo onlineInterviewRepo) {
        this.scoreService = scoreService;
        this.onlineInterviewRepo = onlineInterviewRepo;
    }

    @PostMapping
    @PreAuthorize("hasRole('PANEL_MEMBER') or hasRole('SUPER_ADMIN')")
    public ResponseEntity<ApplicantAnswerScoreResponse> submitScore(
            @RequestBody SubmitScoreRequest request,
            Authentication authentication) {
        return ResponseEntity.ok(scoreService.submitScore(request, authentication.getName()));
    }

    @GetMapping("/interview/{interviewId}")
    @PreAuthorize("hasRole('PANEL_MEMBER') or hasRole('SUPER_ADMIN')")
    public ResponseEntity<List<ApplicantAnswerScoreResponse>> getScoresForInterview(@PathVariable Long interviewId) {
        OnlineInterview interview = onlineInterviewRepo.findById(interviewId)
                .orElseThrow(() -> new RuntimeException("Interview not found"));
        return ResponseEntity.ok(scoreService.getScoresForInterviewDirect(interview));
    }
}