package com.CGL.cgl.Service;

import com.CGL.cgl.DTO.ApplicantAnswerResponse;
import com.CGL.cgl.DTO.PanelScoreSummaryResponse;
import com.CGL.cgl.DTO.SubmitAnswerRequest;
import com.CGL.cgl.Model.*;
import com.CGL.cgl.Repo.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class ApplicantAnswerService {

    private final ApplicantAnswerRepo applicantAnswerRepo;
    private final OnlineInterviewRepo onlineInterviewRepo;
    private final QuestionSetItemRepo questionSetItemRepo;
    private final ApplicantRepo applicantRepo;
    private final ApplicantAnswerScoreRepo scoreRepo;
    private final UserRepo userRepo;

    public ApplicantAnswerService(ApplicantAnswerRepo applicantAnswerRepo, OnlineInterviewRepo onlineInterviewRepo,
                                  QuestionSetItemRepo questionSetItemRepo, ApplicantRepo applicantRepo,ApplicantAnswerScoreRepo scoreRepo, UserRepo userRepo) {
        this.applicantAnswerRepo = applicantAnswerRepo;
        this.onlineInterviewRepo = onlineInterviewRepo;
        this.questionSetItemRepo = questionSetItemRepo;
        this.applicantRepo = applicantRepo;
        this.scoreRepo = scoreRepo;
        this.userRepo = userRepo;
    }

    @Transactional
    public ApplicantAnswerResponse submitAnswer(String interviewToken, SubmitAnswerRequest request, String email) {
        OnlineInterview interview = onlineInterviewRepo.findByInterviewToken(interviewToken)
                .orElseThrow(() -> new RuntimeException("Interview not found"));

        Applicant applicant = applicantRepo.findByUser_Email(email)
                .orElseThrow(() -> new RuntimeException("Applicant not found"));

        Applicant interviewOwner = interview.getApplication().getApplicant();
        if (interviewOwner == null || !interviewOwner.getId().equals(applicant.getId())) {
            throw new RuntimeException("You cannot answer another applicant's interview.");
        }

        if (interview.getStatus() != OnlineInterviewStatus.IN_PROGRESS) {
            throw new RuntimeException("Interview must be started before answering (status: " + interview.getStatus() + ")");
        }

        QuestionSetItem questionSetItem = questionSetItemRepo.findById(request.getQuestionSetItemId())
                .orElseThrow(() -> new RuntimeException("Question not found"));

        if (interview.getQuestionSet() == null
                || questionSetItem.getQuestionSet() == null
                || questionSetItem.getQuestionSet().getId()!=(interview.getQuestionSet().getId())) {
            throw new RuntimeException("This question does not belong to this interview's question set");
        }

        ApplicantAnswer answer = applicantAnswerRepo
                .findByOnlineInterviewAndQuestionSetItem(interview, questionSetItem)
                .orElse(ApplicantAnswer.builder()
                        .onlineInterview(interview)
                        .questionSetItem(questionSetItem)
                        .build());

        answer.setAnswerText(request.getAnswerText());

        ApplicantAnswer saved = applicantAnswerRepo.save(answer);
        return toResponse(saved);
    }

    public List<ApplicantAnswerResponse> getAnswersForInterview(String interviewToken, String email) {
        OnlineInterview interview = onlineInterviewRepo.findByInterviewToken(interviewToken)
                .orElseThrow(() -> new RuntimeException("Interview not found"));

        Applicant applicant = applicantRepo.findByUser_Email(email).orElse(null);
        boolean isOwner = applicant != null
                && interview.getApplication().getApplicant() != null
                && interview.getApplication().getApplicant().getId().equals(applicant.getId());

        if (!isOwner) {
            throw new RuntimeException("You cannot view another applicant's answers.");
        }

        return applicantAnswerRepo.findByOnlineInterview(interview)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public List<ApplicantAnswerResponse> getAnswersForPanel(Long interviewId, String email) {
        Users panelMember = userRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        OnlineInterview interview = onlineInterviewRepo.findById(interviewId)
                .orElseThrow(() -> new RuntimeException("Interview not found"));

        return applicantAnswerRepo.findByOnlineInterview(interview)
                .stream()
                .map(answer -> toResponse(answer, panelMember))
                .toList();
    }
    private ApplicantAnswerResponse toResponse(ApplicantAnswer answer) {
        return toResponse(answer, null);
    }

    private static final Set<QuestionType> OPTION_BASED_TYPES =
            Set.of(QuestionType.MULTIPLE_CHOICE, QuestionType.CHECKBOX, QuestionType.TRUE_FALSE);

    private ApplicantAnswerResponse toResponse(ApplicantAnswer answer, Users panelMember) {
        PanelScoreSummaryResponse myScore = null;
        if (panelMember != null) {
            myScore = scoreRepo.findByApplicantAnswerAndPanelMember(answer, panelMember)
                    .map(s -> PanelScoreSummaryResponse.builder()
                            .scoreId(s.getId())
                            .marksAwarded(s.getMarksAwarded())
                            .comment(s.getComment())
                            .recommended(s.getRecommended())
                            .build())
                    .orElse(null);
        }

        InterviewQuestion question = answer.getQuestionSetItem().getQuestion();
        QuestionType questionType = question.getQuestionType();

        List<String> selectedOptionTexts = null;
        Boolean answeredCorrectly = null;

        if (OPTION_BASED_TYPES.contains(questionType) && answer.getAnswerText() != null) {
            Set<String> selectedIds = Arrays.stream(answer.getAnswerText().split(","))
                    .map(String::trim)
                    .filter(s -> !s.isEmpty())
                    .collect(Collectors.toSet());

            selectedOptionTexts = question.getOptions().stream()
                    .filter(o -> selectedIds.contains(String.valueOf(o.getId())))
                    .map(InterviewQuestionOption::getOptionText)
                    .toList();

            // Only surface correctness to panel members/admins scoring the answer -
            // never to the applicant themselves via getAnswersForInterview.
            if (panelMember != null) {
                Set<String> correctIds = question.getOptions().stream()
                        .filter(o -> Boolean.TRUE.equals(o.getCorrect()))
                        .map(o -> String.valueOf(o.getId()))
                        .collect(Collectors.toSet());
                answeredCorrectly = selectedIds.equals(correctIds);
            }
        }

        return ApplicantAnswerResponse.builder()
                .id(answer.getId())
                .questionSetItemId(answer.getQuestionSetItem().getId())
                .questionText(question.getQuestionText())
                .questionType(questionType)
                .maxMarks(answer.getQuestionSetItem().getMarks())
                .answerText(answer.getAnswerText())
                .selectedOptionTexts(selectedOptionTexts)
                .answeredCorrectly(answeredCorrectly)
                .answeredAt(answer.getAnsweredAt())
                .lastEditedAt(answer.getLastEditedAt())
                .myScore(myScore)
                .build();
    }
}