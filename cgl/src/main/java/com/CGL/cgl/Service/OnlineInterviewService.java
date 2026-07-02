package com.CGL.cgl.Service;

import com.CGL.cgl.DTO.*;
import com.CGL.cgl.Model.*;
import com.CGL.cgl.Repo.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
public class OnlineInterviewService {
    private final OnlineInterviewRepo onlineInterviewRepo;
    private final ApplicationsRepo applicationsRepo;
    private final UserRepo userRepo;
    private final ApplicantRepo applicantRepo;
    private final JobVacancyRepo jobVacancyRepo;
    private final QuestionSetRepo questionSetRepo;
    private final QuestionSetItemRepo questionSetItemRepo;

    public OnlineInterviewService(ApplicationsRepo applicationsRepo, UserRepo userRepo,
                                  OnlineInterviewRepo onlineInterviewRepo, ApplicantRepo applicantRepo,
                                  JobVacancyRepo jobVacancyRepo, QuestionSetRepo questionSetRepo,
                                  QuestionSetItemRepo questionSetItemRepo) {
        this.applicationsRepo = applicationsRepo;
        this.userRepo = userRepo;
        this.onlineInterviewRepo = onlineInterviewRepo;
        this.applicantRepo = applicantRepo;
        this.jobVacancyRepo = jobVacancyRepo;
        this.questionSetRepo = questionSetRepo;
        this.questionSetItemRepo = questionSetItemRepo;
    }

    @Transactional
    public OnlineInterviewResponse createOnlineInterview(OnlineInterviewRequest request, String email) {
        Users user = requireHrOrAdmin(email);

        Applications application = applicationsRepo
                .findById(request.getApplicationId())
                .orElseThrow(() -> new RuntimeException("Application not found"));

        QuestionSet questionSet = questionSetRepo.findById(request.getQuestionSetId())
                .orElseThrow(() -> new RuntimeException("Question set not found"));

        if (!Boolean.TRUE.equals(questionSet.getPublished())) {
            throw new RuntimeException("Question set is not published");
        }
        if (application.getVacancy() != null && questionSet.getVacancy() != null
                && !application.getVacancy().getId().equals(questionSet.getVacancy().getId())) {
            throw new RuntimeException("Question set does not belong to this application's vacancy");
        }

        OnlineInterview saved = createForApplication(request, application, questionSet, user);
        return toResponse(saved);
    }

    @Transactional
    public List<OnlineInterviewResponse> createOnlineInterviewsForVacancy(Long vacancyId, OnlineInterviewWindowRequest windowTemplate, String email) {
        Users user = requireHrOrAdmin(email);

        JobVacancy vacancy = jobVacancyRepo.findById(vacancyId)
                .orElseThrow(() -> new RuntimeException("Vacancy not found"));

        QuestionSet questionSet = resolveQuestionSetForVacancy(vacancy, windowTemplate.getQuestionSetId());

        List<Applications> shortlisted = applicationsRepo
                .findByVacancyAndApplicationStatus(vacancy, ApplicationState.SHORTLISTED);

        List<OnlineInterviewResponse> created = new ArrayList<>();
        for (Applications application : shortlisted) {
            if (onlineInterviewRepo.findByApplication(application).isPresent()) {
                continue;
            }
            OnlineInterviewRequest perCandidateRequest = new OnlineInterviewRequest(
                    application.getId(),
                    questionSet.getId(),
                    windowTemplate.getOpensAt(),
                    windowTemplate.getClosesAt(),
                    windowTemplate.getDurationMinutes()
            );
            OnlineInterview saved = createForApplication(perCandidateRequest, application, questionSet, user);
            created.add(toResponse(saved));
        }
        return created;
    }

    @Transactional
    public OnlineInterviewResponse startInterview(String interviewToken, String email) {
        OnlineInterview interview = onlineInterviewRepo.findByInterviewToken(interviewToken)
                .orElseThrow(() -> new RuntimeException("Interview not found"));

        requireOwnership(interview, email);
        expireIfPastWindow(interview);

        if (interview.getStatus() == OnlineInterviewStatus.IN_PROGRESS) {
            return toResponse(interview);
        }

        if (interview.getStatus() != OnlineInterviewStatus.OPEN) {
            throw new RuntimeException("Interview is not open for starting (status: " + interview.getStatus() + ")");
        }

        LocalDateTime now = LocalDateTime.now();
        if (now.isBefore(interview.getOpensAt())) {
            throw new RuntimeException("Interview has not opened yet");
        }
        if (now.isAfter(interview.getClosesAt())) {
            interview.setStatus(OnlineInterviewStatus.EXPIRED);
            onlineInterviewRepo.save(interview);
            throw new RuntimeException("Interview window has closed");
        }

        interview.setStatus(OnlineInterviewStatus.IN_PROGRESS);
        interview.setStartedAt(now);
        return toResponse(onlineInterviewRepo.save(interview));
    }

    @Transactional
    public OnlineInterviewResponse submitInterview(String interviewToken, String email) {
        OnlineInterview interview = onlineInterviewRepo.findByInterviewToken(interviewToken)
                .orElseThrow(() -> new RuntimeException("Interview not found"));

        requireOwnership(interview, email);

        if (interview.getStatus() != OnlineInterviewStatus.IN_PROGRESS) {
            throw new RuntimeException("Interview is not in progress (status: " + interview.getStatus() + ")");
        }

        interview.setStatus(OnlineInterviewStatus.SUBMITTED);
        interview.setSubmittedAt(LocalDateTime.now());
        interview.setSubmitted(true);
        return toResponse(onlineInterviewRepo.save(interview));
    }

    public ApplicantInterviewResponse getInterviewForApplicant(String interviewToken, String email) {
        OnlineInterview interview = onlineInterviewRepo.findByInterviewToken(interviewToken)
                .orElseThrow(() -> new RuntimeException("Interview not found"));

        requireOwnership(interview, email);
        expireIfPastWindow(interview);

        List<ApplicantInterviewQuestionResponse> questions = interview.getQuestionSet() == null
                ? List.of()
                : questionSetItemRepo.findByQuestionSetOrderByOrderIndexAsc(interview.getQuestionSet())
                .stream()
                .map(item -> ApplicantInterviewQuestionResponse.builder()
                        .questionSetItemId(item.getId())
                        .orderIndex(item.getOrderIndex())
                        .marks(item.getMarks())
                        .required(item.getRequired())
                        .questionTitle(item.getQuestion().getTitle())
                        .questionText(item.getQuestion().getQuestionText())
                        .questionType(item.getQuestion().getQuestionType())
                        .build())
                .toList();

        return ApplicantInterviewResponse.builder()
                .id(interview.getId())
                .vacancyTitle(interview.getApplication().getVacancy() != null
                        ? interview.getApplication().getVacancy().getTitle() : null)
                .status(interview.getStatus())
                .opensAt(interview.getOpensAt())
                .closesAt(interview.getClosesAt())
                .durationMinutes(interview.getDurationMinutes())
                .startedAt(interview.getStartedAt())
                .questions(questions)
                .build();
    }

    public List<OnlineInterviewResponse> getInterviews(Long vacancyId, OnlineInterviewStatus status, String email) {
        requireHrOrAdmin(email);

        List<OnlineInterview> interviews;
        if (vacancyId != null && status != null) {
            JobVacancy vacancy = jobVacancyRepo.findById(vacancyId)
                    .orElseThrow(() -> new RuntimeException("Vacancy not found"));
            interviews = onlineInterviewRepo.findByApplication_VacancyAndStatus(vacancy, status);
        } else if (vacancyId != null) {
            JobVacancy vacancy = jobVacancyRepo.findById(vacancyId)
                    .orElseThrow(() -> new RuntimeException("Vacancy not found"));
            interviews = onlineInterviewRepo.findByApplication_Vacancy(vacancy);
        } else if (status != null) {
            interviews = onlineInterviewRepo.findByStatus(status);
        } else {
            interviews = onlineInterviewRepo.findAll();
        }

        return interviews.stream().map(this::toResponse).toList();
    }

    public OnlineInterviewResponse getInterviewById(Long id, String email) {
        Users user = userRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getRole() != Role.HR_OFFICER && user.getRole() != Role.SUPER_ADMIN && user.getRole() != Role.PANEL_MEMBER) {
            throw new RuntimeException("You are not allowed to perform this action!");
        }

        OnlineInterview interview = onlineInterviewRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Interview not found"));
        return toResponse(interview);
    }

    @Transactional
    public OnlineInterviewResponse expireInterview(Long interviewId, String email) {
        requireHrOrAdmin(email);
        OnlineInterview interview = onlineInterviewRepo.findById(interviewId)
                .orElseThrow(() -> new RuntimeException("Interview not found"));
        expireIfPastWindow(interview);
        return toResponse(interview);
    }

    // --- helpers ---

    private void requireOwnership(OnlineInterview interview, String email) {
        Applicant applicant = applicantRepo.findByUser_Email(email)
                .orElseThrow(() -> new RuntimeException("Applicant not found"));

        Applicant owner = interview.getApplication().getApplicant();
        if (owner == null || !owner.getId().equals(applicant.getId())) {
            throw new RuntimeException("You cannot access another applicant's interview.");
        }
    }

    private Users requireHrOrAdmin(String email) {
        Users user = userRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User Not found"));

        if (user.getRole() != Role.SUPER_ADMIN && user.getRole() != Role.HR_OFFICER) {
            throw new RuntimeException("You are not allowed to perform this action!");
        }
        return user;
    }

    private OnlineInterview createForApplication(OnlineInterviewRequest request, Applications application, QuestionSet questionSet, Users user) {
        if (application.getApplicationStatus() != ApplicationState.SHORTLISTED) {
            throw new RuntimeException("Only shortlisted applications can get interviews");
        }
        if (onlineInterviewRepo.findByApplication(application).isPresent()) {
            throw new RuntimeException("Interview already exists");
        }
        if (request.getDurationMinutes() == null || request.getDurationMinutes() <= 0) {
            throw new RuntimeException("Duration must be greater than 0");
        }
        if (request.getOpensAt() == null || request.getClosesAt() == null
                || !request.getOpensAt().isBefore(request.getClosesAt())) {
            throw new RuntimeException("opensAt must be before closesAt");
        }

        OnlineInterview onlineInterview = OnlineInterview.builder()
                .createdBy(user)
                .durationMinutes(request.getDurationMinutes())
                .opensAt(request.getOpensAt())
                .closesAt(request.getClosesAt())
                .application(application)
                .questionSet(questionSet)
                .interviewToken(UUID.randomUUID().toString())
                .status(OnlineInterviewStatus.OPEN)
                .submitted(false)
                .build();

        return onlineInterviewRepo.save(onlineInterview);
    }

    private QuestionSet resolveQuestionSetForVacancy(JobVacancy vacancy, Long requestedQuestionSetId) {
        if (requestedQuestionSetId != null) {
            QuestionSet questionSet = questionSetRepo.findById(requestedQuestionSetId)
                    .orElseThrow(() -> new RuntimeException("Question set not found"));
            if (!Boolean.TRUE.equals(questionSet.getPublished())) {
                throw new RuntimeException("Question set is not published");
            }
            if (questionSet.getVacancy() == null || !questionSet.getVacancy().getId().equals(vacancy.getId())) {
                throw new RuntimeException("Question set does not belong to this vacancy");
            }
            return questionSet;
        }

        List<QuestionSet> published = questionSetRepo.findByVacancyAndPublished(vacancy, true);
        if (published.isEmpty()) {
            throw new RuntimeException("No published question set exists for this vacancy");
        }
        if (published.size() > 1) {
            throw new RuntimeException("Multiple published question sets exist for this vacancy — specify questionSetId");
        }
        return published.get(0);
    }

    private void expireIfPastWindow(OnlineInterview interview) {
        boolean isActiveState = interview.getStatus() == OnlineInterviewStatus.OPEN
                || interview.getStatus() == OnlineInterviewStatus.IN_PROGRESS;

        if (isActiveState && LocalDateTime.now().isAfter(interview.getClosesAt())) {
            interview.setStatus(OnlineInterviewStatus.EXPIRED);
            onlineInterviewRepo.save(interview);
        }
    }

    private OnlineInterviewResponse toResponse(OnlineInterview interview) {
        Applications application = interview.getApplication();
        Applicant applicant = application.getApplicant();

        return OnlineInterviewResponse.builder()
                .id(interview.getId())
                .applicationId(application.getId())
                .applicantName(applicant != null && applicant.getUser() != null ? applicant.getUser().getFullName() : null)
                .vacancyTitle(application.getVacancy() != null ? application.getVacancy().getTitle() : null)
                .questionSetTitle(interview.getQuestionSet() != null ? interview.getQuestionSet().getTitle() : null)
                .status(interview.getStatus())
                .opensAt(interview.getOpensAt())
                .closesAt(interview.getClosesAt())
                .durationMinutes(interview.getDurationMinutes())
                .startedAt(interview.getStartedAt())
                .submittedAt(interview.getSubmittedAt())
                .interviewToken(interview.getInterviewToken())
                .createdAt(interview.getCreatedAt())
                .build();
    }
}