package com.CGL.cgl.Service;

import com.CGL.cgl.DTO.ApplicationsDTO;
import com.CGL.cgl.Model.*;
import com.CGL.cgl.Repo.ApplicantRepo;
import com.CGL.cgl.Repo.ApplicationsRepo;
import com.CGL.cgl.Repo.JobVacancyRepo;
import com.CGL.cgl.Repo.UserRepo;
import java.time.LocalDateTime;
import java.util.List;
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
            .orElseThrow(() -> new RuntimeException("User does not exist"));

        Applicant applicant = applicantRepo
            .findByUser(user)
            .orElseThrow(() -> new RuntimeException("User profile not found"));

        JobVacancy vacancy = jobVacancyRepo
            .findById(request.getVacancyId())
            .orElseThrow(() -> new RuntimeException("Job vacancy not found"));

        if (vacancy.getStatus() != ApplicationStatus.OPEN) {
            throw new RuntimeException("Job vacancy is not open");
        }
        if (
            applicationsRepo
                .findByApplicantAndVacancy(applicant, vacancy)
                .isPresent()
        ) {
            throw new RuntimeException("You have already applied");
        }

        Applications application = Applications.builder()
            .applicant(applicant)
            .vacancy(vacancy)
            .applicationDate(LocalDateTime.now())
            .applicationStatus(ApplicationState.SUBMITTED)
            .build();

        Applications saved = applicationsRepo.save(application);

        notificationService.createNotification(
            user,
            "Application Received",
            "Your application for " +
                vacancy.getTitle() +
                " has been received and is under review."
        );

        return saved;
    }

    public List<Applications> getMyApplications(String email) {
        Users user = userRepo
            .findByEmail(email)
            .orElseThrow(() -> new RuntimeException("User not found"));
        Applicant applicant = applicantRepo
            .findByUser(user)
            .orElseThrow(() -> new RuntimeException("Profile not found"));
        return applicationsRepo.findByApplicant(applicant);
    }

    public Applications updateStatus(
        Long applicationId,
        ApplicationState status,
        String remarks
    ) {
        Applications application = applicationsRepo
            .findById(applicationId)
            .orElseThrow(() -> new RuntimeException("Application not found"));

        application.setApplicationStatus(status);
        application.setRemarks(remarks);

        Applications saved = applicationsRepo.save(application);

        Users applicantUser = application.getApplicant().getUser();
        String jobTitle = application.getVacancy().getTitle();

        if (status == ApplicationState.REJECTED) {
            notificationService.createNotification(
                applicantUser,
                "Application Unsuccessful",
                "Your application for " + jobTitle + " was unsuccessful."
            );

            emailService.sendEmail(
                applicantUser.getEmail(),
                "Application update: unsuccessful",
                "Hello " +
                    applicantUser.getFName() +
                    ",\n\n" +
                    "We regret to inform you that your application for " +
                    jobTitle +
                    " was unsuccessful." +
                    (remarks != null && !remarks.isBlank()
                        ? "\n\nRemarks: " + remarks
                        : "") +
                    "\n\nThank you for your interest in Laikipia County Jobs."
            );
        }

        return saved;
    }

    public List<Applications> getAllApplicationsForVacancy(Long vacancyId) {
        JobVacancy vacancy = jobVacancyRepo
            .findById(vacancyId)
            .orElseThrow(() -> new RuntimeException("Vacancy not found"));
        return applicationsRepo.findByVacancy(vacancy);
    }

    public List<Applications> getAllApplications() {
        return applicationsRepo.findAll();
    }
}
