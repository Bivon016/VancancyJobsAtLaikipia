package com.CGL.cgl.Service;

import com.CGL.cgl.DTO.AssessmentAnswerRequest;
import com.CGL.cgl.DTO.AssessmentQuestionRequest;
import com.CGL.cgl.DTO.AssessmentQuestionResponse;
import com.CGL.cgl.DTO.AssessmentRequest;
import com.CGL.cgl.DTO.AssessmentResponseDTO;
import com.CGL.cgl.DTO.ApplicantResponseSummary;
import com.CGL.cgl.DTO.RecommendationSummary;
import com.CGL.cgl.Model.Applicant;
import com.CGL.cgl.Model.ApplicationState;
import com.CGL.cgl.Model.Applications;
import com.CGL.cgl.Model.Assessment;
import com.CGL.cgl.Model.AssessmentAnswer;
import com.CGL.cgl.Model.AssessmentQuestion;
import com.CGL.cgl.Model.AssessmentResponse;
import com.CGL.cgl.Model.AssessmentStatus;
import com.CGL.cgl.Model.JobVacancy;
import com.CGL.cgl.Model.QuestionType;
import com.CGL.cgl.Model.Recommendation;
import com.CGL.cgl.Model.Role;
import com.CGL.cgl.Model.Users;
import com.CGL.cgl.Repo.ApplicantRepo;
import com.CGL.cgl.Repo.ApplicationsRepo;
import com.CGL.cgl.Repo.AssessmentAnswerRepo;
import com.CGL.cgl.Repo.AssessmentQuestionRepo;
import com.CGL.cgl.Repo.AssessmentRepo;
import com.CGL.cgl.Repo.AssessmentResponseRepo;
import com.CGL.cgl.Repo.JobVacancyRepo;
import com.CGL.cgl.Repo.UserRepo;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AssessmentServiceImpl implements AssessmentService {

    private final AssessmentRepo assessmentRepo;
    private final AssessmentQuestionRepo assessmentQuestionRepo;
    private final AssessmentResponseRepo assessmentResponseRepo;
    private final AssessmentAnswerRepo assessmentAnswerRepo;
    private final JobVacancyRepo jobVacancyRepo;
    private final ApplicationsRepo applicationsRepo;
    private final ApplicantRepo applicantRepo;
    private final UserRepo userRepo;
    private final NotificationService notificationService;
    private final EmailService emailService;

    public AssessmentServiceImpl(
        AssessmentRepo assessmentRepo,
        AssessmentQuestionRepo assessmentQuestionRepo,
        AssessmentResponseRepo assessmentResponseRepo,
        AssessmentAnswerRepo assessmentAnswerRepo,
        JobVacancyRepo jobVacancyRepo,
        ApplicationsRepo applicationsRepo,
        ApplicantRepo applicantRepo,
        UserRepo userRepo,
        NotificationService notificationService,
        EmailService emailService
    ) {
        this.assessmentRepo = assessmentRepo;
        this.assessmentQuestionRepo = assessmentQuestionRepo;
        this.assessmentResponseRepo = assessmentResponseRepo;
        this.assessmentAnswerRepo = assessmentAnswerRepo;
        this.jobVacancyRepo = jobVacancyRepo;
        this.applicationsRepo = applicationsRepo;
        this.applicantRepo = applicantRepo;
        this.userRepo = userRepo;
        this.notificationService = notificationService;
        this.emailService = emailService;
    }

    @Override
    @Transactional
    public AssessmentResponseDTO createAssessment(AssessmentRequest request, String email) {
        Users actor = requireUser(email);
        if (actor.getRole() != Role.SUPER_ADMIN && actor.getRole() != Role.HR_OFFICER) {
            throw new RuntimeException("Only HR officers and admins can create assessments");
        }
        JobVacancy vacancy = jobVacancyRepo.findById(request.getVacancyId())
            .orElseThrow(() -> new RuntimeException("Vacancy not found"));

        Assessment assessment = Assessment.builder()
            .vacancy(vacancy)
            .title(request.getTitle())
            .instructions(request.getInstructions())
            .createdBy(actor)
            .status(AssessmentStatus.DRAFT)
            .build();

        Assessment saved = assessmentRepo.save(assessment);
        return toResponse(saved);
    }

    @Override
    @Transactional
    public AssessmentQuestionResponse addQuestion(Long assessmentId, AssessmentQuestionRequest request, String email) {
        Users actor = requireUser(email);
        if (actor.getRole() != Role.SUPER_ADMIN && actor.getRole() != Role.HR_OFFICER && actor.getRole() != Role.PANEL_MEMBER) {
            throw new RuntimeException("Only panel members, HR officers and admins can add questions");
        }
        Assessment assessment = assessmentRepo.findById(assessmentId)
            .orElseThrow(() -> new RuntimeException("Assessment not found"));
        if (assessment.getStatus() != AssessmentStatus.DRAFT) {
            throw new RuntimeException("Questions can only be added while the assessment is still draft");
        }
        int nextOrder = assessmentQuestionRepo.findByAssessmentOrderByOrderIndexAsc(assessment).size();
        AssessmentQuestion question = AssessmentQuestion.builder()
            .assessment(assessment)
            .questionText(request.getQuestionText())
            .questionType(request.getQuestionType() != null ? request.getQuestionType() : QuestionType.SHORT_ANSWER)
            .orderIndex(nextOrder + 1)
            .build();
        AssessmentQuestion saved = assessmentQuestionRepo.save(question);
        return toQuestionResponse(saved);
    }

    @Override
    @Transactional
    public void deleteQuestion(Long questionId, String email) {
        Users actor = requireUser(email);
        if (actor.getRole() != Role.SUPER_ADMIN && actor.getRole() != Role.HR_OFFICER && actor.getRole() != Role.PANEL_MEMBER) {
            throw new RuntimeException("Only panel members, HR officers and admins can delete questions");
        }
        AssessmentQuestion question = assessmentQuestionRepo.findById(questionId)
            .orElseThrow(() -> new RuntimeException("Question not found"));
        if (question.getAssessment().getStatus() != AssessmentStatus.DRAFT) {
            throw new RuntimeException("Questions can only be deleted while the assessment is still draft");
        }
        assessmentQuestionRepo.delete(question);
    }

    @Override
    @Transactional
    public AssessmentResponseDTO activateAssessment(Long assessmentId, String email) {
        Users actor = requireUser(email);
        if (actor.getRole() != Role.SUPER_ADMIN && actor.getRole() != Role.HR_OFFICER) {
            throw new RuntimeException("Only HR officers and admins can activate assessments");
        }
        Assessment assessment = assessmentRepo.findById(assessmentId)
            .orElseThrow(() -> new RuntimeException("Assessment not found"));
        if (assessment.getStatus() != AssessmentStatus.DRAFT) {
            throw new RuntimeException("Assessment is not in draft state");
        }
        assessment.setStatus(AssessmentStatus.ACTIVE);
        Assessment saved = assessmentRepo.save(assessment);

        JobVacancy vacancy = assessment.getVacancy();
        List<Applications> shortlisted = applicationsRepo.findByVacancy(vacancy).stream()
            .filter(application -> application.getApplicationStatus() == ApplicationState.SHORTLISTED)
            .toList();

        for (Applications application : shortlisted) {
            Users applicantUser = application.getApplicant().getUser();
            notificationService.createNotification(
                applicantUser,
                "Assessment available",
                "A new pre-screening assessment is ready for you. Please complete it from your portal."
            );
            String departmentName = vacancy.getDepartment() != null
                ? vacancy.getDepartment().getDepartmentName()
                : "Laikipia County";
            String assessmentLink = "http://localhost:5173/assessment/" + assessment.getId();
            String html = EmailTemplates.assessmentInvited(
                applicantUser.getFName(),
                vacancy.getTitle(),
                departmentName,
                assessmentLink
            );
            emailService.sendHtmlEmail(applicantUser.getEmail(), "Complete your pre-screening assessment", html);
        }

        return toResponse(saved);
    }

    @Override
    @Transactional
    public AssessmentResponseDTO closeAssessment(Long assessmentId, String email) {
        Users actor = requireUser(email);
        if (actor.getRole() != Role.SUPER_ADMIN && actor.getRole() != Role.HR_OFFICER) {
            throw new RuntimeException("Only HR officers and admins can close assessments");
        }
        Assessment assessment = assessmentRepo.findById(assessmentId)
            .orElseThrow(() -> new RuntimeException("Assessment not found"));
        if (assessment.getStatus() == AssessmentStatus.CLOSED) {
            throw new RuntimeException("Assessment is already closed");
        }
        assessment.setStatus(AssessmentStatus.CLOSED);
        return toResponse(assessmentRepo.save(assessment));
    }

    @Override
    @Transactional(readOnly = true)
    public List<AssessmentResponseDTO> getAvailableAssessmentsForApplicant(String email) {
        Users applicantUser = requireUser(email);
        if (applicantUser.getRole() != Role.APPLICANT) {
            throw new RuntimeException("Only applicants can access available assessments");
        }

        Applicant applicant = applicantRepo.findByUser(applicantUser)
            .orElseThrow(() -> new RuntimeException("Applicant profile not found"));

        return applicationsRepo.findByApplicant(applicant).stream()
            .filter(application -> application.getApplicationStatus() == ApplicationState.SHORTLISTED)
            .flatMap(application -> assessmentRepo.findAll().stream()
                .filter(assessment -> assessment.getVacancy().getId().equals(application.getVacancy().getId()))
                .filter(assessment -> assessment.getStatus() == AssessmentStatus.ACTIVE)
                .filter(assessment -> !assessmentResponseRepo.existsByAssessmentAndApplicant(assessment, applicantUser))
                .map(this::toResponse))
            .distinct()
            .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<AssessmentResponseDTO> getAllAssessments(String email) {
        Users actor = requireUser(email);
        if (actor.getRole() != Role.SUPER_ADMIN && actor.getRole() != Role.HR_OFFICER && actor.getRole() != Role.PANEL_MEMBER) {
            throw new RuntimeException("You are not authorized to view assessments");
        }
        return assessmentRepo.findAll().stream().map(this::toResponse).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public Object getAssessmentForApplicant(Long assessmentId, String email) {
        Users currentUser = requireUser(email);
        Assessment assessment = assessmentRepo.findById(assessmentId)
            .orElseThrow(() -> new RuntimeException("Assessment not found"));

        if (currentUser.getRole() == Role.APPLICANT) {
            if (assessment.getStatus() != AssessmentStatus.ACTIVE) {
                throw new RuntimeException("This assessment is no longer accepting responses");
            }

            Applicant applicant = applicantRepo.findByUser(currentUser)
                .orElseThrow(() -> new RuntimeException("Applicant profile not found"));
            Applications application = applicationsRepo.findByApplicantAndVacancy(applicant, assessment.getVacancy())
                .orElseThrow(() -> new RuntimeException("No application found for this vacancy"));
            if (application.getApplicationStatus() != ApplicationState.SHORTLISTED) {
                throw new RuntimeException("You are not eligible to take this assessment");
            }
            if (assessmentResponseRepo.existsByAssessmentAndApplicant(assessment, currentUser)) {
                throw new RuntimeException("You have already submitted");
            }
        } else if (currentUser.getRole() != Role.SUPER_ADMIN
            && currentUser.getRole() != Role.HR_OFFICER
            && currentUser.getRole() != Role.CPSB_ADMIN
            && currentUser.getRole() != Role.DEPT_HEAD
            && currentUser.getRole() != Role.PANEL_MEMBER) {
            throw new RuntimeException("You are not authorized to access this assessment");
        }

        return List.of(toResponse(assessment), assessmentQuestionRepo.findByAssessmentOrderByOrderIndexAsc(assessment).stream().map(this::toQuestionResponse).toList());
    }

    @Override
    @Transactional
    public void submitResponse(Long assessmentId, List<AssessmentAnswerRequest> answers, String email) {
        Users applicantUser = requireUser(email);
        if (applicantUser.getRole() != Role.APPLICANT) {
            throw new RuntimeException("Only applicants can submit responses");
        }
        Assessment assessment = assessmentRepo.findById(assessmentId)
            .orElseThrow(() -> new RuntimeException("Assessment not found"));
        if (assessment.getStatus() != AssessmentStatus.ACTIVE) {
            throw new RuntimeException("This assessment is no longer accepting responses");
        }
        Applicant applicant = applicantRepo.findByUser(applicantUser)
            .orElseThrow(() -> new RuntimeException("Applicant profile not found"));
        if (assessmentResponseRepo.existsByAssessmentAndApplicant(assessment, applicantUser)) {
            throw new RuntimeException("You have already submitted");
        }
        Applications application = applicationsRepo.findByApplicantAndVacancy(applicant, assessment.getVacancy())
            .orElseThrow(() -> new RuntimeException("No application found for this vacancy"));
        if (application.getApplicationStatus() != ApplicationState.SHORTLISTED) {
            throw new RuntimeException("You are not eligible to take this assessment");
        }

        AssessmentResponse response = assessmentResponseRepo.save(AssessmentResponse.builder()
            .assessment(assessment)
            .applicant(applicantUser)
            .build());

        List<AssessmentQuestion> questions = assessmentQuestionRepo.findByAssessmentOrderByOrderIndexAsc(assessment);
        if (answers == null || answers.isEmpty()) {
            throw new RuntimeException("Please provide answers for all questions");
        }
        for (AssessmentAnswerRequest answerRequest : answers) {
            AssessmentQuestion question = questions.stream()
                .filter(q -> q.getId().equals(answerRequest.getQuestionId()))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Question not found"));
            assessmentAnswerRepo.save(AssessmentAnswer.builder()
                .response(response)
                .question(question)
                .answerText(answerRequest.getAnswerText())
                .build());
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<ApplicantResponseSummary> getResponsesForAssessment(Long assessmentId, String email) {
        Users actor = requireUser(email);
        if (actor.getRole() != Role.SUPER_ADMIN && actor.getRole() != Role.HR_OFFICER && actor.getRole() != Role.PANEL_MEMBER) {
            throw new RuntimeException("You are not authorized to view responses");
        }
        Assessment assessment = assessmentRepo.findById(assessmentId)
            .orElseThrow(() -> new RuntimeException("Assessment not found"));
        return assessmentResponseRepo.findByAssessment(assessment).stream()
            .map(this::toApplicantSummary)
            .toList();
    }

    @Override
    @Transactional
    public void submitRecommendation(Long responseId, Recommendation recommendation, String email) {
        Users actor = requireUser(email);
        if (actor.getRole() != Role.SUPER_ADMIN && actor.getRole() != Role.HR_OFFICER && actor.getRole() != Role.PANEL_MEMBER) {
            throw new RuntimeException("You are not authorized to submit recommendations");
        }
        AssessmentResponse response = assessmentResponseRepo.findById(responseId)
            .orElseThrow(() -> new RuntimeException("Response not found"));
        response.setRecommendation(recommendation);
        response.setReviewedBy(actor);
        response.setReviewedAt(java.time.LocalDateTime.now());
        assessmentResponseRepo.save(response);
    }

    @Override
    @Transactional(readOnly = true)
    public RecommendationSummary getRecommendationSummary(Long vacancyId, String email) {
        Users actor = requireUser(email);
        if (actor.getRole() != Role.SUPER_ADMIN && actor.getRole() != Role.HR_OFFICER) {
            throw new RuntimeException("Only HR officers and admins can view recommendation summaries");
        }
        JobVacancy vacancy = jobVacancyRepo.findById(vacancyId)
            .orElseThrow(() -> new RuntimeException("Vacancy not found"));
        Assessment assessment = assessmentRepo.findByVacancyAndStatus(vacancy, AssessmentStatus.ACTIVE).stream().findFirst().orElse(null);
        if (assessment == null) {
            return RecommendationSummary.builder()
                .vacancyTitle(vacancy.getTitle())
                .totalShortlisted(0)
                .totalSubmitted(0)
                .responses(new ArrayList<>())
                .build();
        }
        List<AssessmentResponse> responses = assessmentResponseRepo.findByAssessment(assessment);
        return RecommendationSummary.builder()
            .vacancyTitle(vacancy.getTitle())
            .totalShortlisted(applicationsRepo.findByVacancy(vacancy).stream().filter(application -> application.getApplicationStatus() == ApplicationState.SHORTLISTED).count())
            .totalSubmitted(responses.size())
            .responses(responses.stream().map(this::toApplicantSummary).toList())
            .build();
    }

    private Users requireUser(String email) {
        return userRepo.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
    }

    private AssessmentResponseDTO toResponse(Assessment assessment) {
        return AssessmentResponseDTO.builder()
            .id(assessment.getId())
            .vacancyId(assessment.getVacancy().getId())
            .vacancyTitle(assessment.getVacancy().getTitle())
            .title(assessment.getTitle())
            .instructions(assessment.getInstructions())
            .status(assessment.getStatus())
            .createdByName(assessment.getCreatedBy() != null ? assessment.getCreatedBy().getFName() + " " + assessment.getCreatedBy().getLName() : null)
            .createdAt(assessment.getCreatedAt())
            .questionCount(assessmentQuestionRepo.findByAssessmentOrderByOrderIndexAsc(assessment).size())
            .submissionCount(assessmentResponseRepo.findByAssessment(assessment).size())
            .build();
    }

    private AssessmentQuestionResponse toQuestionResponse(AssessmentQuestion question) {
        return AssessmentQuestionResponse.builder()
            .id(question.getId())
            .assessmentId(question.getAssessment().getId())
            .questionText(question.getQuestionText())
            .questionType(question.getQuestionType())
            .orderIndex(question.getOrderIndex())
            .build();
    }

    private ApplicantResponseSummary toApplicantSummary(AssessmentResponse response) {
        List<ApplicantResponseSummary.AnswerSummary> answers = assessmentAnswerRepo.findByResponse(response).stream()
            .map(answer -> ApplicantResponseSummary.AnswerSummary.builder()
                .questionText(answer.getQuestion().getQuestionText())
                .answerText(answer.getAnswerText())
                .build())
            .toList();
        return ApplicantResponseSummary.builder()
            .responseId(response.getId())
            .applicantName(response.getApplicant() != null ? response.getApplicant().getFName() + " " + response.getApplicant().getLName() : null)
            .applicantEmail(response.getApplicant() != null ? response.getApplicant().getEmail() : null)
            .submittedAt(response.getSubmittedAt())
            .recommendation(response.getRecommendation())
            .answers(answers)
            .build();
    }
}
