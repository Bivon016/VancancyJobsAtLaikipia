package com.CGL.cgl.Service;

import com.CGL.cgl.DTO.FinalSelectionRequest;
import com.CGL.cgl.Model.*;
import com.CGL.cgl.Repo.*;
import java.util.List;
import java.util.Optional;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class FinalSelectionServiceImpl implements FinalSelectionService {

    private final FinalSelectionRepo finalSelectionRepo;
    private final ApplicationsRepo applicationsRepo;
    private final UserRepo userRepo;
    private final JobVacancyRepo jobVacancyRepo;
    private final NotificationService notificationService;
    private final EmailService emailService;

    public FinalSelectionServiceImpl(
        FinalSelectionRepo finalSelectionRepo,
        ApplicationsRepo applicationsRepo,
        UserRepo userRepo,
        JobVacancyRepo jobVacancyRepo,
        NotificationService notificationService,
        EmailService emailService
    ) {
        this.finalSelectionRepo = finalSelectionRepo;
        this.applicationsRepo = applicationsRepo;
        this.userRepo = userRepo;
        this.jobVacancyRepo = jobVacancyRepo;
        this.notificationService = notificationService;
        this.emailService = emailService;
    }

    @Override
    @Transactional
    public FinalSelection selectCandidate(
        FinalSelectionRequest request,
        String email
    ) {
        // 1. Get logged in user
        Users user = userRepo
            .findByEmail(email)
            .orElseThrow(() -> new RuntimeException("User not found"));

        // 2. Check role
        if (user.getRole() != Role.CPSB_ADMIN) {
            throw new RuntimeException("Only CPSB Admin can select candidates");
        }

        // 3. Get application
        Applications application = applicationsRepo
            .findById(request.getApplicationId())
            .orElseThrow(() -> new RuntimeException("Application not found"));

        // 4. Check application status
        if (application.getApplicationStatus() != ApplicationState.INTERVIEW) {
            throw new RuntimeException(
                "Only interviewed applicants can be selected"
            );
        }

        // 5. Check already selected
        Optional<FinalSelection> existing =
            finalSelectionRepo.findByApplication(application);

        if (existing.isPresent()) {
            throw new RuntimeException("Applicant already selected");
        }

        // 6. Update application status
        application.setApplicationStatus(ApplicationState.SELECTED);

        applicationsRepo.save(application);

        // 7. Create selection
        FinalSelection selection = FinalSelection.builder()
            .application(application)
            .approvedBy(user)
            .appointmentStatus(AppointmentStatus.PENDING_APPOINTMENT)
            .remarks(request.getRemarks())
            .build();

        FinalSelection saved = finalSelectionRepo.save(selection);

        // 7b. Notify applicant — ADD THIS
        Users applicantUser = application.getApplicant().getUser();
        notificationService.createNotification(
            applicantUser,
            "Selection Outcome",
            "Congratulations! You have been selected for " +
                application.getVacancy().getTitle() +
                "."
        );

        emailService.sendEmail(
            applicantUser.getEmail(),
            "Application update: accepted",
            "Hello " +
                applicantUser.getFName() +
                ",\n\n" +
                "Congratulations! You have been accepted for " +
                application.getVacancy().getTitle() +
                "." +
                (request.getRemarks() != null && !request.getRemarks().isBlank()
                    ? "\n\nRemarks: " + request.getRemarks()
                    : "") +
                "\n\nPlease log in to your portal for the next steps."
        );

        // 8. Check vacancy capacity
        JobVacancy vacancy = application.getVacancy();

        Long selectedCount =
            applicationsRepo.countByVacancyAndApplicationStatus(
                vacancy,
                ApplicationState.SELECTED
            );

        if (selectedCount >= vacancy.getPositionsAvailable()) {
            vacancy.setStatus(ApplicationStatus.FILLED);
            jobVacancyRepo.save(vacancy);
        }

        return saved;
    }

    @Override
    @Transactional
    public FinalSelection updateAppointmentStatus(
        Long selectionId,
        AppointmentStatus status,
        String email
    ) {
        Users user = userRepo
            .findByEmail(email)
            .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getRole() != Role.CPSB_ADMIN) {
            throw new RuntimeException(
                "Only CPSB Admin can update appointment"
            );
        }

        FinalSelection selection = finalSelectionRepo
            .findById(selectionId)
            .orElseThrow(() -> new RuntimeException("Selection not found"));

        selection.setAppointmentStatus(status);

        return finalSelectionRepo.save(selection);
    }

    @Override
    public List<FinalSelection> getSelectionsByVacancy(Long vacancyId) {
        return finalSelectionRepo.findByApplication_Vacancy_Id(vacancyId);
    }
}
