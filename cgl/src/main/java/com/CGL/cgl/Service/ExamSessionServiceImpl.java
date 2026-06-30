package com.CGL.cgl.Service;

import com.CGL.cgl.DTO.ExamStartResponse;
import com.CGL.cgl.DTO.InterviewAnswerRequest;
import com.CGL.cgl.DTO.InterviewAnswerResponse;
import com.CGL.cgl.Model.*;
import com.CGL.cgl.Repo.*;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ExamSessionServiceImpl implements ExamSessionService {

    private final InterviewRepo interviewRepo;
    private final InterviewQuestionRepo interviewQuestionRepo;
    private final InterviewAnswerRepo interviewAnswerRepo;
    private final UserRepo usersRepo;
    private final InterviewAnswerService interviewAnswerService;

    public ExamSessionServiceImpl(
            InterviewRepo interviewRepo,
            InterviewQuestionRepo interviewQuestionRepo,
            InterviewAnswerRepo interviewAnswerRepo,
            UserRepo usersRepo,
            InterviewAnswerService interviewAnswerService
    ) {
        this.interviewRepo = interviewRepo;
        this.interviewQuestionRepo = interviewQuestionRepo;
        this.interviewAnswerRepo = interviewAnswerRepo;
        this.usersRepo = usersRepo;
        this.interviewAnswerService = interviewAnswerService;
    }

    @Override
    @Transactional
    public ExamStartResponse startExam(Long interviewId, String email) {
        Users user = usersRepo
                .findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getRole() != Role.APPLICANT) {
            throw new RuntimeException("Only applicants can start an exam");
        }

        Interview interview = interviewRepo
                .findById(interviewId)
                .orElseThrow(() -> new RuntimeException("Interview not found"));

        Applicant applicant = interview.getApplication().getApplicant();
        if (applicant == null || applicant.getUser() == null
                || !applicant.getUser().getEmail().equals(email)) {
            throw new RuntimeException("You are not the applicant for this interview");
        }

        if (interview.getStatus() != InterviewStatus.SCHEDULED) {
            throw new RuntimeException("This exam cannot be started — current status: " + interview.getStatus());
        }

        if (interview.getDurationMinutes() == null) {
            throw new RuntimeException("This interview has no exam duration configured");
        }

        interview.setExamStartedAt(LocalDateTime.now());
        interview.setStatus(InterviewStatus.IN_PROGRESS);
        Interview saved = interviewRepo.save(interview);

        LocalDateTime deadline = saved.getExamStartedAt().plusMinutes(saved.getDurationMinutes());

        return ExamStartResponse.builder()
                .interviewId(saved.getId())
                .examStartedAt(saved.getExamStartedAt())
                .deadline(deadline)
                .durationMinutes(saved.getDurationMinutes())
                .build();
    }

    @Override
    @Transactional
    public List<InterviewAnswerResponse> autoSubmitRemaining(
            Long interviewId,
            List<InterviewAnswerRequest> answers,
            String email
    ) {
        Users user = usersRepo
                .findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getRole() != Role.APPLICANT) {
            throw new RuntimeException("Only applicants can submit exam answers");
        }

        Interview interview = interviewRepo
                .findById(interviewId)
                .orElseThrow(() -> new RuntimeException("Interview not found"));

        Applicant applicant = interview.getApplication().getApplicant();
        if (applicant == null || applicant.getUser() == null
                || !applicant.getUser().getEmail().equals(email)) {
            throw new RuntimeException("You are not the applicant for this interview");
        }

        if (interview.getStatus() != InterviewStatus.IN_PROGRESS) {
            throw new RuntimeException("This exam is not currently in progress");
        }

        // Grace window: allow the bulk submit slightly past the deadline to
        // account for network latency, but not indefinitely.
        LocalDateTime deadline = interview.getExamStartedAt().plusMinutes(interview.getDurationMinutes());
        LocalDateTime graceLimit = deadline.plusSeconds(30);
        if (LocalDateTime.now().isAfter(graceLimit)) {
            throw new RuntimeException("Auto-submit window has expired");
        }

        for (InterviewAnswerRequest request : answers) {
            InterviewQuestion question = interviewQuestionRepo.findById(request.getQuestionId()).orElse(null);
            if (question == null || !question.getInterview().getId().equals(interviewId)) {
                continue; // skip malformed entries rather than failing the whole batch
            }
            if (interviewAnswerRepo.existsByQuestion(question)) {
                continue; // already answered manually before time ran out
            }
            interviewAnswerService.submitAnswerInternal(question, request.getAnswerText(), applicant.getUser());
        }

        boolean allAnswered = interviewQuestionRepo.findByInterview(interview).stream()
                .allMatch(q -> interviewAnswerRepo.existsByQuestion(q));

        interview.setStatus(allAnswered ? InterviewStatus.COMPLETED : InterviewStatus.EXPIRED);
        interviewRepo.save(interview);

        return interviewAnswerRepo.findByInterview(interview).stream()
                .map(interviewAnswerService::toResponsePublic)
                .toList();
    }

    // Backstop: catches sessions where the client never called autoSubmitRemaining
    // (browser closed, app crashed, network dropped at the worst moment).
    @Scheduled(fixedRate = 60000)
    @Transactional
    public void closeExpiredExams() {
        LocalDateTime now = LocalDateTime.now();
        List<Interview> inProgress = interviewRepo.findByStatus(InterviewStatus.IN_PROGRESS);

        for (Interview interview : inProgress) {
            LocalDateTime deadline = interview.getExamStartedAt()
                    .plusMinutes(interview.getDurationMinutes());
            if (now.isAfter(deadline)) {
                boolean allAnswered = interviewQuestionRepo.findByInterview(interview).stream()
                        .allMatch(q -> interviewAnswerRepo.existsByQuestion(q));
                interview.setStatus(allAnswered ? InterviewStatus.COMPLETED : InterviewStatus.EXPIRED);
                interviewRepo.save(interview);
            }
        }
    }
}