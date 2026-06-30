package com.CGL.cgl.Controller;

import com.CGL.cgl.DTO.ExamStartResponse;
import com.CGL.cgl.DTO.InterviewAnswerRequest;
import com.CGL.cgl.DTO.InterviewAnswerResponse;
import com.CGL.cgl.Service.ExamSessionService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/exam-session")
public class ExamSessionController {

    private final ExamSessionService examSessionService;

    public ExamSessionController(ExamSessionService examSessionService) {
        this.examSessionService = examSessionService;
    }

    /**
     * Applicant starts their timed exam session.
     * Only callable once per interview, only when interview status is SCHEDULED.
     * Transitions interview status to IN_PROGRESS.
     *
     * @param interviewId the interview ID
     * @param authentication the authenticated user (applicant)
     * @return ExamStartResponse containing examStartedAt, deadline, durationMinutes
     */
    @PostMapping("/{interviewId}/start")
    @PreAuthorize("hasRole('APPLICANT')")
    public ResponseEntity<ExamStartResponse> startExam(
            @PathVariable Long interviewId,
            Authentication authentication
    ) {
        String email = authentication.getName();
        ExamStartResponse response = examSessionService.startExam(interviewId, email);
        return ResponseEntity.ok(response);
    }

    /**
     * Auto-submit any drafted answers when the countdown timer hits zero.
     * Called by the frontend as a best-effort save. Backend also has a server-side
     * sweep as a backstop.
     *
     * @param interviewId the interview ID
     * @param answers list of answers to submit (questionId, answerText pairs)
     * @param authentication the authenticated user (applicant)
     * @return list of InterviewAnswerResponse for each submitted answer
     */
    @PostMapping("/{interviewId}/auto-submit")
    @PreAuthorize("hasRole('APPLICANT')")
    public ResponseEntity<List<InterviewAnswerResponse>> autoSubmitRemaining(
            @PathVariable Long interviewId,
            @RequestBody List<InterviewAnswerRequest> answers,
            Authentication authentication
    ) {
        String email = authentication.getName();
        List<InterviewAnswerResponse> responses =
                examSessionService.autoSubmitRemaining(interviewId, answers, email);
        return ResponseEntity.ok(responses);
    }
}
