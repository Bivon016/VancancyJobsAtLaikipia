package com.CGL.cgl.Service;

import com.CGL.cgl.DTO.InterviewQuestionRequest;
import com.CGL.cgl.DTO.InterviewQuestionResponse;
import com.CGL.cgl.Model.*;
import com.CGL.cgl.Repo.*;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

@Service
public class InterviewQuestionServiceImpl implements InterviewQuestionService {

    private final InterviewQuestionRepo interviewQuestionRepo;
    private final InterviewAnswerRepo interviewAnswerRepo;
    private final InterviewRepo interviewRepo;
    private final InterviewPanelRepo interviewPanelRepo;
    private final UserRepo usersRepo;
    private final JobVacancyRepo jobVacancyRepo;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public InterviewQuestionServiceImpl(
            InterviewQuestionRepo interviewQuestionRepo,
            InterviewAnswerRepo interviewAnswerRepo,
            InterviewRepo interviewRepo,
            InterviewPanelRepo interviewPanelRepo,
            UserRepo usersRepo,
            JobVacancyRepo jobVacancyRepo
    ) {
        this.interviewQuestionRepo = interviewQuestionRepo;
        this.interviewAnswerRepo = interviewAnswerRepo;
        this.interviewRepo = interviewRepo;
        this.interviewPanelRepo = interviewPanelRepo;
        this.usersRepo = usersRepo;
        this.jobVacancyRepo = jobVacancyRepo;
    }

    @Override
    @Transactional
    public InterviewQuestionResponse postQuestion(InterviewQuestionRequest request, String email) {
        Users user = usersRepo
                .findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getRole() != Role.PANEL_MEMBER && user.getRole() != Role.SUPER_ADMIN && user.getRole() != Role.HR_OFFICER) {
            throw new RuntimeException("Only panel members, HR officers and admins can post questions");
        }

        if (request.getMaxScore() != null && request.getMaxScore() <= 0) {
            throw new RuntimeException("Max score must be a positive number");
        }

        if (request.getQuestionText() == null || request.getQuestionText().trim().isEmpty()) {
            throw new RuntimeException("Question text is required");
        }

        var builder = InterviewQuestion.builder()
                .createdBy(user)
                .interview_question(request.getQuestionText())
                .questionType(request.getQuestionType() != null ? request.getQuestionType() : QuestionType.ESSAY)
                .required(request.getRequired() != null ? request.getRequired() : Boolean.TRUE)
                .modelAnswer(request.getModelAnswer())
                .markingRubric(request.getMarkingRubric())
                .correctAnswer(request.getCorrectAnswer())
                .maxScore(request.getMaxScore())
                .status(QuestionStatus.OPEN);

        if (request.getOptions() != null && !request.getOptions().isEmpty()) {
            try {
                builder.optionsJson(objectMapper.writeValueAsString(request.getOptions()));
            } catch (Exception e) {
                throw new RuntimeException("Unable to serialize question options", e);
            }
        }

        if (request.getInterviewId() != null) {
            Interview interview = interviewRepo
                    .findById(request.getInterviewId())
                    .orElseThrow(() -> new RuntimeException("Interview not found"));

            if (user.getRole() == Role.PANEL_MEMBER) {
                boolean assigned = interviewPanelRepo.existsByInterviewAndPanelMember(interview, user);
                if (!assigned) {
                    throw new RuntimeException("You are not assigned to this interview");
                }
            }

            if (interview.getStatus() == InterviewStatus.COMPLETED) {
                throw new RuntimeException("Cannot post questions to a completed interview");
            }

            builder.interview(interview)
                    .vacancy(interview.getApplication() != null ? interview.getApplication().getVacancy() : null);
        } else if (request.getVacancyId() != null) {
            JobVacancy vacancy = jobVacancyRepo
                    .findById(request.getVacancyId())
                    .orElseThrow(() -> new RuntimeException("Vacancy not found"));
            builder.vacancy(vacancy);
        } else {
            throw new RuntimeException("Either interviewId or vacancyId is required");
        }

        InterviewQuestion question = builder.build();

        InterviewQuestion saved = interviewQuestionRepo.save(question);

        return toResponse(saved, false);
    }

    @Override
    @Transactional
    public List<InterviewQuestionResponse> postQuestionsBatch(List<InterviewQuestionRequest> requests, String email) {
        if (requests == null || requests.isEmpty()) {
            return Collections.emptyList();
        }

        List<InterviewQuestionResponse> responses = new ArrayList<>();
        for (InterviewQuestionRequest request : requests) {
            responses.add(postQuestion(request, email));
        }
        return responses;
    }
    @Override
    @Transactional(readOnly = true)
    public List<InterviewQuestionResponse> getQuestionsForInterview(Long interviewId, String email) {
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
            // admins and HR can view any interview's questions, no extra check
        } else {
            throw new RuntimeException("You are not authorized to view these questions");
        }

        List<InterviewQuestion> questions = interviewQuestionRepo.findForInterviewOrVacancy(
                interview,
                interview.getApplication() != null ? interview.getApplication().getVacancy() : null
        );

        return questions.stream()
                .map(q -> toResponse(q, interviewAnswerRepo.existsByQuestion(q)))
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<InterviewQuestionResponse> getQuestionsForVacancy(Long vacancyId, String email) {
        Users user = usersRepo
                .findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getRole() != Role.PANEL_MEMBER && user.getRole() != Role.SUPER_ADMIN && user.getRole() != Role.HR_OFFICER) {
            throw new RuntimeException("You are not authorized to view these questions");
        }

        JobVacancy vacancy = jobVacancyRepo
                .findById(vacancyId)
                .orElseThrow(() -> new RuntimeException("Vacancy not found"));

        List<InterviewQuestion> questions = interviewQuestionRepo.findVacancyQuestionsWithDetails(vacancy);

        return questions.stream()
                .map(q -> toResponse(q, interviewAnswerRepo.existsByQuestion(q)))
                .toList();
    }

    @Override
    @Transactional
    public InterviewQuestionResponse updateQuestionStatus(Long questionId, QuestionStatus status, String email) {
        Users user = usersRepo
                .findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getRole() != Role.PANEL_MEMBER && user.getRole() != Role.SUPER_ADMIN) {
            throw new RuntimeException("Only panel members can update question status");
        }

        InterviewQuestion question = interviewQuestionRepo
                .findById(questionId)
                .orElseThrow(() -> new RuntimeException("Question not found"));

        if (user.getRole() == Role.PANEL_MEMBER) {
            boolean assigned = interviewPanelRepo.existsByInterviewAndPanelMember(
                    question.getInterview(), user
            );
            if (!assigned) {
                throw new RuntimeException("You are not assigned to this interview");
            }
        }

        question.setStatus(status);
        InterviewQuestion saved = interviewQuestionRepo.save(question);

        return toResponse(saved, interviewAnswerRepo.existsByQuestion(saved));
    }
    @Override
    @Transactional
    public void deleteQuestion(Long questionId, String email) {
        Users user = usersRepo
                .findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        InterviewQuestion question = interviewQuestionRepo
                .findById(questionId)
                .orElseThrow(() -> new RuntimeException("Question not found"));

        // Only the panel member who posted it (or an admin) can delete it
        boolean isOwner = question.getCreatedBy().getEmail().equals(email);
        boolean isAdmin = user.getRole() == Role.SUPER_ADMIN;

        if (!isOwner && !isAdmin) {
            throw new RuntimeException("You are not authorized to delete this question");
        }

        if (interviewAnswerRepo.existsByQuestion(question)) {
            throw new RuntimeException("Cannot delete a question that has already been answered");
        }

        interviewQuestionRepo.delete(question);
    }

    private InterviewQuestionResponse toResponse(InterviewQuestion question, boolean answered) {
        return InterviewQuestionResponse.builder()
                .id(question.getId())
                .interviewId(question.getInterview() != null ? question.getInterview().getId() : null)
                .questionText(question.getInterview_question())
                .questionType(question.getQuestionType())
                .options(parseOptions(question.getOptionsJson()))
                .required(question.getRequired())
                .maxScore(question.getMaxScore())
                .createdByName(question.getCreatedBy().getFName() + " " + question.getCreatedBy().getLName())
                .createdAt(question.getCreatedAt())
                .status(question.getStatus())
                .answered(answered)
                .build();
    }

    private List<String> parseOptions(String optionsJson) {
        if (optionsJson == null || optionsJson.isBlank()) {
            return null;
        }
        try {
            return objectMapper.readValue(optionsJson, new TypeReference<List<String>>() {});
        } catch (Exception e) {
            return null;
        }
    }
}