package com.CGL.cgl.Service;

import com.CGL.cgl.DTO.InterviewAnswerRequest;
import com.CGL.cgl.DTO.InterviewAnswerResponse;
import com.CGL.cgl.DTO.LlmScoreResult;
import com.CGL.cgl.Model.*;
import com.CGL.cgl.Repo.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class InterviewAnswerServiceImpl implements InterviewAnswerService {

    private final InterviewAnswerRepo interviewAnswerRepo;
    private final InterviewQuestionRepo interviewQuestionRepo;
    private final InterviewRepo interviewRepo;
    private final InterviewPanelRepo interviewPanelRepo;
    private final UserRepo usersRepo;
    private final LlmScoringService llmScoringService;

    public InterviewAnswerServiceImpl(
            InterviewAnswerRepo interviewAnswerRepo,
            InterviewQuestionRepo interviewQuestionRepo,
            InterviewRepo interviewRepo,
            InterviewPanelRepo interviewPanelRepo,
            UserRepo usersRepo,
            LlmScoringService llmScoringService
    ) {
        this.interviewAnswerRepo = interviewAnswerRepo;
        this.interviewQuestionRepo = interviewQuestionRepo;
        this.interviewRepo = interviewRepo;
        this.interviewPanelRepo = interviewPanelRepo;
        this.usersRepo = usersRepo;
        this.llmScoringService = llmScoringService;
    }

    @Override
    @Transactional
    public InterviewAnswerResponse submitAnswer(InterviewAnswerRequest request, String email) {
        Users user = usersRepo
                .findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getRole() != Role.APPLICANT) {
            throw new RuntimeException("Only applicants can submit answers");
        }

        InterviewQuestion question = interviewQuestionRepo
                .findById(request.getQuestionId())
                .orElseThrow(() -> new RuntimeException("Question not found"));

        Interview interview = question.getInterview();

        Applicant applicant = interview.getApplication().getApplicant();
        if (applicant == null || applicant.getUser() == null
                || !applicant.getUser().getEmail().equals(email)) {
            throw new RuntimeException("You are not the applicant for this interview");
        }

        if (interview.getStatus() != InterviewStatus.IN_PROGRESS) {
            throw new RuntimeException("This exam is not currently in progress");
        }

        if (interview.getExamStartedAt() == null || interview.getDurationMinutes() == null) {
            throw new RuntimeException("This interview has no active exam session");
        }

        LocalDateTime deadline = interview.getExamStartedAt().plusMinutes(interview.getDurationMinutes());
        if (LocalDateTime.now().isAfter(deadline)) {
            throw new RuntimeException("Time is up — this exam session has expired");
        }

        if (question.getStatus() == QuestionStatus.CLOSED) {
            throw new RuntimeException("This question is closed and can no longer be answered");
        }

        if (interviewAnswerRepo.existsByQuestion(question)) {
            throw new RuntimeException("This question has already been answered");
        }

        InterviewAnswer saved = submitAnswerInternal(question, request.getAnswerText(), user);

        return toResponsePublic(saved);
    }

    /**
     * Shared save+score logic, callable both from the normal applicant-facing
     * submitAnswer flow and from the auto-submit-on-timeout flow. Does NOT
     * re-check role/ownership/deadline — callers are responsible for that,
     * since auto-submit runs on behalf of the applicant rather than as a
     * direct authenticated request from them.
     */


    @Override
    @Transactional(readOnly = true)
    public List<InterviewAnswerResponse> getAnswersForInterview(Long interviewId, String email) {
        Users user = usersRepo
                .findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Interview interview = interviewRepo
                .findById(interviewId)
                .orElseThrow(() -> new RuntimeException("Interview not found"));

        if (user.getRole() == Role.PANEL_MEMBER) {
            boolean assigned = interviewPanelRepo.existsByInterviewAndPanelMember(interview, user);
            if (!assigned) {
                throw new RuntimeException("You are not assigned to this interview");
            }
        } else if (user.getRole() == Role.APPLICANT) {
            Applicant applicant = interview.getApplication().getApplicant();
            if (applicant == null || applicant.getUser() == null
                    || !applicant.getUser().getEmail().equals(email)) {
                throw new RuntimeException("You are not the applicant for this interview");
            }
        } else if (user.getRole() == Role.SUPER_ADMIN || user.getRole() == Role.HR_OFFICER) {
            // admins and HR can view any interview's answers, no extra check
        } else {
            throw new RuntimeException("You are not authorized to view these answers");
        }

        List<InterviewAnswer> answers = interviewAnswerRepo.findByInterview(interview);

        return answers.stream()
                .map(this::toResponsePublic)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public InterviewAnswerResponse getAnswerForQuestion(Long questionId, String email) {
        Users user = usersRepo
                .findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        InterviewQuestion question = interviewQuestionRepo
                .findById(questionId)
                .orElseThrow(() -> new RuntimeException("Question not found"));

        Interview interview = question.getInterview();

        if (user.getRole() == Role.PANEL_MEMBER) {
            boolean assigned = interviewPanelRepo.existsByInterviewAndPanelMember(interview, user);
            if (!assigned) {
                throw new RuntimeException("You are not assigned to this interview");
            }
        } else if (user.getRole() == Role.APPLICANT) {
            Applicant applicant = interview.getApplication().getApplicant();
            if (applicant == null || applicant.getUser() == null
                    || !applicant.getUser().getEmail().equals(email)) {
                throw new RuntimeException("You are not the applicant for this interview");
            }
        } else if (user.getRole() == Role.SUPER_ADMIN || user.getRole() == Role.HR_OFFICER) {
            // admins and HR can view, no extra check
        } else {
            throw new RuntimeException("You are not authorized to view this answer");
        }

        InterviewAnswer answer = interviewAnswerRepo
                .findByQuestion(question)
                .orElseThrow(() -> new RuntimeException("This question has not been answered yet"));

        return toResponsePublic(answer);
    }
    @Override
    @Transactional
    public InterviewAnswer submitAnswerInternal(InterviewQuestion question, String answerText, Users applicant) {
        InterviewAnswer answer = InterviewAnswer.builder()
                .question(question)
                .interview(question.getInterview())
                .applicant(applicant)
                .answerText(answerText)
                .scoreStatus(ScoreStatus.PENDING)
                .build();

        InterviewAnswer saved = interviewAnswerRepo.save(answer);

        question.setStatus(QuestionStatus.ANSWERED);
        interviewQuestionRepo.save(question);

        try {
            if (question.getCorrectAnswer() != null && !question.getCorrectAnswer().isBlank()) {
                int maxScore = question.getMaxScore() != null ? question.getMaxScore() : 100;
                boolean correct;

                if (question.getQuestionType() == QuestionType.MULTI_SELECT) {
                    correct = isMultiSelectCorrect(answerText, question.getCorrectAnswer());
                } else if (question.getQuestionType() == QuestionType.MULTIPLE_CHOICE || question.getQuestionType() == QuestionType.YES_NO) {
                    correct = answerText.trim().equalsIgnoreCase(question.getCorrectAnswer().trim());
                } else {
                    correct = false;
                }

                if (question.getQuestionType() == QuestionType.MULTI_SELECT
                        || question.getQuestionType() == QuestionType.MULTIPLE_CHOICE
                        || question.getQuestionType() == QuestionType.YES_NO) {
                    saved.setScore(correct ? maxScore : 0);
                    saved.setFeedback(correct ? "Correct selection." : "Incorrect selection.");
                    saved.setScoreStatus(ScoreStatus.SCORED);
                } else {
                    LlmScoreResult result = llmScoringService.scoreAnswer(question, answerText);
                    saved.setScore(result.getScore());
                    saved.setFeedback(result.getFeedback());
                    saved.setScoreStatus(ScoreStatus.SCORED);
                }
            } else {
                LlmScoreResult result = llmScoringService.scoreAnswer(question, answerText);
                saved.setScore(result.getScore());
                saved.setFeedback(result.getFeedback());
                saved.setScoreStatus(ScoreStatus.SCORED);
            }
        } catch (Exception e) {
            saved.setScoreStatus(ScoreStatus.FAILED);
            saved.setFeedback("Automated scoring failed — please notify the panel.");
        }

        return interviewAnswerRepo.save(saved);
    }

    private boolean isMultiSelectCorrect(String answerText, String correctAnswer) {
        List<String> normalizedAnswer = normalizeSelections(answerText);
        List<String> normalizedCorrect = normalizeSelections(correctAnswer);
        return normalizedAnswer.size() == normalizedCorrect.size() && normalizedAnswer.containsAll(normalizedCorrect);
    }

    private List<String> normalizeSelections(String raw) {
        if (raw == null) {
            return List.of();
        }
        return List.of(raw.split(","))
                .stream()
                .map(String::trim)
                .filter(s -> !s.isBlank())
                .map(String::toLowerCase)
                .distinct()
                .toList();
    }

    @Override
    public InterviewAnswerResponse toResponsePublic(InterviewAnswer answer) {
        return InterviewAnswerResponse.builder()
                .id(answer.getId())
                .questionId(answer.getQuestion().getId())
                .questionText(answer.getQuestion().getInterview_question())
                .interviewId(answer.getInterview().getId())
                .applicantName(answer.getApplicant().getFName() + " " + answer.getApplicant().getLName())
                .submittedAt(answer.getSubmittedAt())
                .answerText(answer.getAnswerText())
                .score(answer.getScore())
                .feedback(answer.getFeedback())
                .scoreStatus(answer.getScoreStatus())
                .build();
    }
}
