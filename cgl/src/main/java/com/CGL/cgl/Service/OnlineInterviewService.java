package com.CGL.cgl.Service;

import com.CGL.cgl.DTO.*;
import com.CGL.cgl.Exception.ConflictException;
import com.CGL.cgl.Exception.ForbiddenException;
import com.CGL.cgl.Exception.ResourceNotFoundException;
import com.CGL.cgl.Model.*;
import com.CGL.cgl.Repo.*;
import com.CGL.cgl.Service.EmailService;
import com.CGL.cgl.Service.EmailTemplates;
import com.CGL.cgl.Service.NotificationService;
import org.springframework.beans.factory.annotation.Value;
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
    private final NotificationService notificationService;
    private final EmailService emailService;

    @Value("${app.frontend-base-url:http://localhost:5173}")
    private String frontendBaseUrl;

    public OnlineInterviewService(ApplicationsRepo applicationsRepo, UserRepo userRepo,
                                  OnlineInterviewRepo onlineInterviewRepo, ApplicantRepo applicantRepo,
                                  JobVacancyRepo jobVacancyRepo, QuestionSetRepo questionSetRepo,
                                  QuestionSetItemRepo questionSetItemRepo,
                                  NotificationService notificationService,
                                  EmailService emailService) {
        this.applicationsRepo = applicationsRepo;
        this.userRepo = userRepo;
        this.onlineInterviewRepo = onlineInterviewRepo;
        this.applicantRepo = applicantRepo;
        this.jobVacancyRepo = jobVacancyRepo;
        this.questionSetRepo = questionSetRepo;
        this.questionSetItemRepo = questionSetItemRepo;
        this.notificationService = notificationService;
        this.emailService = emailService;
    }

    @Transactional
    public OnlineInterviewResponse createOnlineInterview(OnlineInterviewRequest request, String email) {
        Users user = requireHrOrAdmin(email);

        Applications application = applicationsRepo
                .findById(request.getApplicationId())
                .orElseThrow(() -> new ResourceNotFoundException("Application not found"));

        QuestionSet questionSet = questionSetRepo.findById(request.getQuestionSetId())
                .orElseThrow(() -> new ResourceNotFoundException("Question set not found"));

        if (!Boolean.TRUE.equals(questionSet.getPublished())) {
            throw new ConflictException("Question set is not published");
        }
        if (application.getVacancy() != null && questionSet.getVacancy() != null
                && !application.getVacancy().getId().equals(questionSet.getVacancy().getId())) {
            throw new ConflictException("Question set does not belong to this application's vacancy");
        }

        OnlineInterview saved = createForApplication(request, application, questionSet, user);
        return toResponse(saved);
    }

    @Transactional
    public OnlineInterviewBulkScheduleResult createOnlineInterviewsForVacancy(Long vacancyId, OnlineInterviewWindowRequest windowTemplate, String email) {
        Users user = requireHrOrAdmin(email);

        JobVacancy vacancy = jobVacancyRepo.findById(vacancyId)
                .orElseThrow(() -> new ResourceNotFoundException("Vacancy not found"));

        QuestionSet questionSet = resolveQuestionSetForVacancy(vacancy, windowTemplate.getQuestionSetId());

        List<Applications> shortlisted = applicationsRepo
                .findByVacancyAndApplicationStatus(vacancy, ApplicationState.SHORTLISTED);

        List<OnlineInterviewResponse> created = new ArrayList<>();
        int alreadyScheduledCount = 0;
        for (Applications application : shortlisted) {
            if (onlineInterviewRepo.findByApplication(application).isPresent()) {
                alreadyScheduledCount++;
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

        // NOTE: this only ever schedules applicants whose status is exactly
        // SHORTLISTED. An applicant who is still SUBMITTED/UNDER_REVIEW (not
        // yet shortlisted), or who has already moved past SHORTLISTED, is
        // silently excluded from `shortlisted` entirely — that's the #1
        // reason a "successful" schedule call can create zero interviews.
        return OnlineInterviewBulkScheduleResult.builder()
                .created(created)
                .totalShortlisted(shortlisted.size())
                .alreadyScheduledCount(alreadyScheduledCount)
                .createdCount(created.size())
                .build();
    }

    @Transactional
    public OnlineInterviewResponse startInterview(String interviewToken, String email) {
        OnlineInterview interview = onlineInterviewRepo.findByInterviewToken(interviewToken)
                .orElseThrow(() -> new ResourceNotFoundException("Interview not found"));

        requireOwnership(interview, email);
        expireIfPastWindow(interview);

        if (interview.getStatus() == OnlineInterviewStatus.IN_PROGRESS) {
            return toResponse(interview);
        }

        if (interview.getStatus() != OnlineInterviewStatus.OPEN) {
            throw new ConflictException("Interview is not open for starting (status: " + interview.getStatus() + ")");
        }

        LocalDateTime now = LocalDateTime.now();
        if (now.isBefore(interview.getOpensAt())) {
            throw new ConflictException("Interview has not opened yet");
        }
        if (now.isAfter(interview.getClosesAt())) {
            interview.setStatus(OnlineInterviewStatus.EXPIRED);
            onlineInterviewRepo.save(interview);
            throw new ConflictException("Interview window has closed");
        }

        interview.setStatus(OnlineInterviewStatus.IN_PROGRESS);
        interview.setStartedAt(now);
        return toResponse(onlineInterviewRepo.save(interview));
    }

    @Transactional
    public OnlineInterviewResponse submitInterview(String interviewToken, String email) {
        OnlineInterview interview = onlineInterviewRepo.findByInterviewToken(interviewToken)
                .orElseThrow(() -> new ResourceNotFoundException("Interview not found"));

        requireOwnership(interview, email);

        if (interview.getStatus() != OnlineInterviewStatus.IN_PROGRESS) {
            throw new ConflictException("Interview is not in progress (status: " + interview.getStatus() + ")");
        }

        interview.setStatus(OnlineInterviewStatus.SUBMITTED);
        interview.setSubmittedAt(LocalDateTime.now());
        interview.setSubmitted(true);
        return toResponse(onlineInterviewRepo.save(interview));
    }
    @Transactional(readOnly = true)
    public ApplicantInterviewResponse getInterviewForApplicant(String interviewToken, String email) {
        OnlineInterview interview = onlineInterviewRepo.findByInterviewToken(interviewToken)
                .orElseThrow(() -> new ResourceNotFoundException("Interview not found"));

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
                        .questionText(item.getQuestion().getQuestionText())
                        .questionType(item.getQuestion().getQuestionType())
                        .options(item.getQuestion().getOptions().stream()
                                .sorted((a, b) -> {
                                    Integer ai = a.getOrderIndex() != null ? a.getOrderIndex() : 0;
                                    Integer bi = b.getOrderIndex() != null ? b.getOrderIndex() : 0;
                                    return ai.compareTo(bi);
                                })
                                .map(o -> ApplicantQuestionOptionResponse.builder()
                                        .id(o.getId())
                                        .optionText(o.getOptionText())
                                        .orderIndex(o.getOrderIndex())
                                        .build())
                                .toList())
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
    @Transactional(readOnly = true)
    public List<OnlineInterviewResponse> getMyInterviews(String email) {
        Applicant applicant = applicantRepo.findByUser_Email(email)
                .orElseThrow(() -> new ResourceNotFoundException("Applicant not found"));

        List<OnlineInterview> interviews = onlineInterviewRepo.findByApplication_Applicant(applicant);
        interviews.forEach(this::expireIfPastWindow);

        return interviews.stream()
                .filter(interview -> interview.getStatus() == OnlineInterviewStatus.OPEN
                        || interview.getStatus() == OnlineInterviewStatus.IN_PROGRESS)
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<OnlineInterviewResponse> getInterviews(Long vacancyId, OnlineInterviewStatus status, String email) {
        requireHrOrAdmin(email);

        List<OnlineInterview> interviews;
        if (vacancyId != null && status != null) {
            JobVacancy vacancy = jobVacancyRepo.findById(vacancyId)
                    .orElseThrow(() -> new ResourceNotFoundException("Vacancy not found"));
            interviews = onlineInterviewRepo.findByApplication_VacancyAndStatus(vacancy, status);
        } else if (vacancyId != null) {
            JobVacancy vacancy = jobVacancyRepo.findById(vacancyId)
                    .orElseThrow(() -> new ResourceNotFoundException("Vacancy not found"));
            interviews = onlineInterviewRepo.findByApplication_Vacancy(vacancy);
        } else if (status != null) {
            interviews = onlineInterviewRepo.findByStatus(status);
        } else {
            interviews = onlineInterviewRepo.findAll();
        }

        return interviews.stream().map(this::toResponse).toList();
    }
    @Transactional(readOnly = true)
    public OnlineInterviewResponse getInterviewById(Long id, String email) {
        Users user = userRepo.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (user.getRole() != Role.HR_OFFICER && user.getRole() != Role.SUPER_ADMIN && user.getRole() != Role.PANEL_MEMBER) {
            throw new ForbiddenException("You are not allowed to perform this action!");
        }

        OnlineInterview interview = onlineInterviewRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Interview not found"));
        return toResponse(interview);
    }

    @Transactional
    public OnlineInterviewResponse expireInterview(Long interviewId, String email) {
        requireHrOrAdmin(email);
        OnlineInterview interview = onlineInterviewRepo.findById(interviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Interview not found"));
        expireIfPastWindow(interview);
        return toResponse(interview);
    }

    // --- helpers ---

    private void requireOwnership(OnlineInterview interview, String email) {
        Applicant applicant = applicantRepo.findByUser_Email(email)
                .orElseThrow(() -> new ResourceNotFoundException("Applicant not found"));

        Applicant owner = interview.getApplication().getApplicant();
        if (owner == null || !owner.getId().equals(applicant.getId())) {
            throw new ForbiddenException("You cannot access another applicant's interview.");
        }
    }

    private Users requireHrOrAdmin(String email) {
        Users user = userRepo.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User Not found"));

        if (user.getRole() != Role.SUPER_ADMIN && user.getRole() != Role.HR_OFFICER) {
            throw new ForbiddenException("You are not allowed to perform this action!");
        }
        return user;
    }

    private OnlineInterview createForApplication(OnlineInterviewRequest request, Applications application, QuestionSet questionSet, Users user) {
        if (application.getApplicationStatus() != ApplicationState.SHORTLISTED) {
            throw new ConflictException("Only shortlisted applications can get interviews");
        }
        if (onlineInterviewRepo.findByApplication(application).isPresent()) {
            throw new ConflictException("Interview already exists");
        }
        if (request.getDurationMinutes() == null || request.getDurationMinutes() <= 0) {
            throw new ConflictException("Duration must be greater than 0");
        }
        if (request.getOpensAt() == null || request.getClosesAt() == null
                || !request.getOpensAt().isBefore(request.getClosesAt())) {
            throw new ConflictException("opensAt must be before closesAt");
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

        OnlineInterview saved = onlineInterviewRepo.save(onlineInterview);
        notifyApplicantOfInterview(saved);
        return saved;
    }

    private QuestionSet resolveQuestionSetForVacancy(JobVacancy vacancy, Long requestedQuestionSetId) {
        if (requestedQuestionSetId != null) {
            QuestionSet questionSet = questionSetRepo.findById(requestedQuestionSetId)
                    .orElseThrow(() -> new ResourceNotFoundException("Question set not found"));
            if (questionSet.getVacancy() == null || !questionSet.getVacancy().getId().equals(vacancy.getId())) {
                throw new ConflictException("Question set does not belong to this vacancy");
            }
            if (!Boolean.TRUE.equals(questionSet.getPublished())) {
                if (questionSet.getItems() == null || questionSet.getItems().isEmpty()) {
                    throw new ConflictException("Cannot schedule an empty question set");
                }
                questionSet.setPublished(true);
                questionSetRepo.save(questionSet);
            }
            return questionSet;
        }

        List<QuestionSet> published = questionSetRepo.findByVacancyAndPublished(vacancy, true);
        if (published.isEmpty()) {
            throw new ConflictException("No published question set exists for this vacancy");
        }
        if (published.size() > 1) {
            throw new ConflictException("Multiple published question sets exist for this vacancy — specify questionSetId");
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

    private void notifyApplicantOfInterview(OnlineInterview interview) {
        Applicant applicant = interview.getApplication().getApplicant();
        if (applicant == null || applicant.getUser() == null) {
            return;
        }

        Users applicantUser = applicant.getUser();
        String vacancyTitle = interview.getApplication().getVacancy() != null
                ? interview.getApplication().getVacancy().getTitle()
                : "your vacancy";
        String opens = interview.getOpensAt() != null ? interview.getOpensAt().toString() : "unknown";
        String closes = interview.getClosesAt() != null ? interview.getClosesAt().toString() : "unknown";

        String portalLink = frontendBaseUrl.replaceAll("/+$", "") + "/interview/" + interview.getInterviewToken();
        String notificationMessage = String.format(
                "Your online interview for %s is available from %s until %s. Start it here: %s",
                vacancyTitle, opens, closes, portalLink);

        notificationService.createNotification(
                applicantUser,
                "Online interview invitation",
                notificationMessage
        );
        String departmentName = interview.getApplication().getVacancy() != null
                && interview.getApplication().getVacancy().getDepartment() != null
                ? interview.getApplication().getVacancy().getDepartment().getDepartmentName()
                : "Laikipia County";

        String htmlBody = EmailTemplates.interviewScheduled(
                applicantUser.getFName(),
                vacancyTitle,
                departmentName,
                String.valueOf(interview.getApplication().getId()),
                opens,
                closes,
                portalLink
        );

        emailService.sendHtmlEmail(
                applicantUser.getEmail(),
                "Online interview invitation",
                htmlBody
        );
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