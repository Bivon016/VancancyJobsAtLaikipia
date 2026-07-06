package com.CGL.cgl.Service;

import com.CGL.cgl.DTO.ApplicationRefereeDTO;
import com.CGL.cgl.DTO.ApplicationsDTO;
import com.CGL.cgl.Exception.ConflictException;
import com.CGL.cgl.Exception.ForbiddenException;
import com.CGL.cgl.Exception.ResourceNotFoundException;
import com.CGL.cgl.Model.Applicant;
import com.CGL.cgl.Model.ApplicationReferee;
import com.CGL.cgl.Model.ApplicationState;
import com.CGL.cgl.Model.ApplicationStatus;
import com.CGL.cgl.Model.Applications;
import com.CGL.cgl.Model.JobVacancy;
import com.CGL.cgl.Model.Role;
import com.CGL.cgl.Model.Users;
import com.CGL.cgl.Repo.ApplicantRepo;
import com.CGL.cgl.Repo.ApplicationsRepo;
import com.CGL.cgl.Repo.JobVacancyRepo;
import com.CGL.cgl.Repo.UserRepo;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;

@Service
public class ApplicationService {

    private final ApplicationsRepo applicationsRepo;
    private final UserRepo userRepo;
    private final ApplicantRepo applicantRepo;
    private final JobVacancyRepo jobVacancyRepo;
    private final NotificationService notificationService;
    private final EmailService emailService;

    public ApplicationService(
        ApplicationsRepo applicationsRepo,
        UserRepo userRepo,
        ApplicantRepo applicantRepo,
        JobVacancyRepo jobVacancyRepo,
        NotificationService notificationService,
        EmailService emailService
    ) {
        this.applicationsRepo = applicationsRepo;
        this.userRepo = userRepo;
        this.applicantRepo = applicantRepo;
        this.jobVacancyRepo = jobVacancyRepo;
        this.notificationService = notificationService;
        this.emailService = emailService;
    }

    public Applications applyForJob(ApplicationsDTO request, String email) {
        Users user = userRepo
            .findByEmail(email)
            .orElseThrow(() ->
                new ResourceNotFoundException("User does not exist")
            );

        Applicant applicant = applicantRepo
            .findByUser(user)
            .orElseThrow(() ->
                new ResourceNotFoundException("User profile not found")
            );

        validateApplicantProfile(applicant);

        JobVacancy vacancy = jobVacancyRepo
            .findById(request.getVacancyId())
            .orElseThrow(() ->
                new ResourceNotFoundException("Job vacancy not found")
            );

        if (vacancy.getStatus() != ApplicationStatus.OPEN) {
            throw new ConflictException("Job vacancy is not open");
        }
        if (
            applicationsRepo
                .findByApplicantAndVacancy(applicant, vacancy)
                .isPresent()
        ) {
            throw new ConflictException("You have already applied");
        }

        if (request.getReferees() == null || request.getReferees().isEmpty()) {
            throw new ConflictException("At least one referee is required");
        }

        Applications application = Applications.builder()
            .applicant(applicant)
            .vacancy(vacancy)
            .applicationDate(LocalDateTime.now())
            .applicationStatus(ApplicationState.SUBMITTED)
            .suitabilityStatement(request.getSuitabilityStatement().trim())
            .declareInformationTrue(request.isDeclareInformationTrue())
            .declareAvailabilityForVerification(
                request.isDeclareAvailabilityForVerification()
            )
            .declareNoConflictOfInterest(
                request.isDeclareNoConflictOfInterest()
            )
            .declareNoCriminalConviction(
                request.isDeclareNoCriminalConviction()
            )
            .consentToDataProcessing(request.isConsentToDataProcessing())
            .documentsReadyConfirmed(request.isDocumentsReadyConfirmed())
            .build();

        List<ApplicationReferee> referees = request
            .getReferees()
            .stream()
            .map(ref -> toReferee(ref, application))
            .collect(Collectors.toList());
        application.setReferees(referees);

        Applications saved = applicationsRepo.save(application);

        notificationService.createNotification(
            user,
            "Application Received",
            "Your application for " +
                vacancy.getTitle() +
                " has been received and is under review."
        );

        String referenceNo = String.valueOf(saved.getId());
        String departmentName = vacancy.getDepartment() != null
            ? vacancy.getDepartment().getDepartmentName()
            : "Laikipia County";

        String htmlBody = EmailTemplates.applicationReceived(
            user.getFName(),
            vacancy.getTitle(),
            departmentName,
            referenceNo
        );

        emailService.sendHtmlEmail(
            user.getEmail(),
            "Application Received: " + vacancy.getTitle(),
            htmlBody
        );

        return saved;
    }

    public List<Applications> getMyApplications(String email) {
        Users user = userRepo
            .findByEmail(email)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        Applicant applicant = applicantRepo
            .findByUser(user)
            .orElseThrow(() ->
                new ResourceNotFoundException("Profile not found")
            );
        return applicationsRepo.findByApplicant(applicant);
    }

    public Applications updateStatus(
        Long applicationId,
        ApplicationState status,
        String remarks
    ) {
        Applications application = applicationsRepo
            .findById(applicationId)
            .orElseThrow(() ->
                new ResourceNotFoundException("Application not found")
            );

        application.setApplicationStatus(status);
        application.setRemarks(remarks);

        Applications saved = applicationsRepo.save(application);

        Applicant applicant = application.getApplicant();
        if (applicant == null) {
            throw new ResourceNotFoundException("Applicant not found for application");
        }
        Users applicantUser = applicant.getUser();
        String jobTitle = application.getVacancy().getTitle();

        if (status == ApplicationState.REJECTED) {
            notificationService.createNotification(
                applicantUser,
                "Application Unsuccessful",
                "Your application for " + jobTitle + " was unsuccessful."
            );

            String referenceNo = String.valueOf(application.getId());
            String departmentName = application.getVacancy().getDepartment() != null
                ? application.getVacancy().getDepartment().getDepartmentName()
                : "Laikipia County";

            String htmlBody = EmailTemplates.rejected(
                applicantUser.getFName(),
                jobTitle,
                departmentName,
                referenceNo
            );

            emailService.sendHtmlEmail(
                applicantUser.getEmail(),
                "Application update: unsuccessful",
                htmlBody
            );
        }

        return saved;
    }

    public List<Applications> getAllApplicationsForVacancy(Long vacancyId, boolean includeClosed) {
        JobVacancy vacancy = jobVacancyRepo
            .findById(vacancyId)
            .orElseThrow(() ->
                new ResourceNotFoundException("Vacancy not found")
            );
        return includeClosed
            ? applicationsRepo.findByVacancy(vacancy)
            : applicationsRepo.findByVacancyAndClosed(vacancy, false);
    }

    public List<Applications> getAllApplications(boolean includeClosed) {
        return includeClosed
            ? applicationsRepo.findAll()
            : applicationsRepo.findByClosed(false);
    }

    public List<Applications> getClosedApplications() {
        return applicationsRepo.findByClosed(true);
    }

    public Applications markApplicationDone(Long applicationId, String email) {
        Applications application = applicationsRepo
            .findById(applicationId)
            .orElseThrow(() -> new ResourceNotFoundException("Application not found"));

        Users user = userRepo
            .findByEmail(email)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (user.getRole() != Role.SUPER_ADMIN && user.getRole() != Role.HR_OFFICER) {
            throw new ForbiddenException("Only Super Admin or HR Officer can mark an application as done");
        }

        if (application.isClosed()) {
            throw new ConflictException("Application is already marked as done");
        }

        application.setClosed(true);
        application.setClosedAt(LocalDateTime.now());
        application.setClosedBy(user);

        return applicationsRepo.save(application);
    }

    public Applications reopenApplication(Long applicationId, String email) {
        Applications application = applicationsRepo
            .findById(applicationId)
            .orElseThrow(() -> new ResourceNotFoundException("Application not found"));

        Users user = userRepo
            .findByEmail(email)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (user.getRole() != Role.SUPER_ADMIN && user.getRole() != Role.HR_OFFICER) {
            throw new ForbiddenException("Only Super Admin or HR Officer can reopen an application");
        }

        if (!application.isClosed()) {
            throw new ConflictException("Application is not marked as done");
        }

        application.setClosed(false);
        application.setClosedAt(null);
        application.setClosedBy(null);

        return applicationsRepo.save(application);
    }

    private ApplicationReferee toReferee(
        ApplicationRefereeDTO referee,
        Applications application
    ) {
        return ApplicationReferee.builder()
            .application(application)
            .fullName(referee.getFullName().trim())
            .designation(referee.getDesignation().trim())
            .organization(referee.getOrganization().trim())
            .phoneNumber(referee.getPhoneNumber().trim())
            .email(referee.getEmail().trim())
            .relationship(referee.getRelationship().trim())
            .build();
    }

    private void validateApplicantProfile(Applicant applicant) {
        if (
            applicant.getNationalId() == null ||
            applicant.getBirthDate() == null ||
            applicant.getGender() == null ||
            isBlank(applicant.getNationality()) ||
            isBlank(applicant.getPhysicalAddress()) ||
            isBlank(applicant.getCountyOfBirth()) ||
            isBlank(applicant.getCountyOfResidence()) ||
            isBlank(applicant.getEducationalLevel()) ||
            applicant.getYearsOfExperience() == null
        ) {
            throw new ConflictException(
                "Complete your applicant profile before applying for a vacancy"
            );
        }
    }

    private boolean isBlank(String value) {
        return value == null || value.trim().isEmpty();
    }
}
