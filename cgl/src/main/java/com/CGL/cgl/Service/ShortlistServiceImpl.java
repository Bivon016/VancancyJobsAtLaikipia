package com.CGL.cgl.Service;

import com.CGL.cgl.DTO.ShortlistRequest;
import com.CGL.cgl.DTO.ShortlistResponseDTO;
import com.CGL.cgl.Model.*;
import com.CGL.cgl.Repo.*;
import java.util.List;
import java.util.Optional;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ShortlistServiceImpl implements ShortlistService {

    private final ShortlistRepo shortlistRepo;
    private final ApplicationsRepo applicationsRepo;
    private final UserRepo usersRepo;
    private final NotificationService notificationService;
    private final EmailService emailService;

    public ShortlistServiceImpl(
        ShortlistRepo shortlistRepo,
        ApplicationsRepo applicationsRepo,
        UserRepo usersRepo,
        NotificationService notificationService,
        EmailService emailService
    ) {
        this.shortlistRepo = shortlistRepo;
        this.applicationsRepo = applicationsRepo;
        this.usersRepo = usersRepo;
        this.notificationService = notificationService;
        this.emailService = emailService;
    }

    @Override
    @Transactional
    public ShortlistResponseDTO shortlistApplicant(
        ShortlistRequest request,
        String email
    ) {
        Users user = usersRepo
            .findByEmail(email)
            .orElseThrow(() -> new RuntimeException("User not found"));

        if (
            user.getRole() != Role.HR_OFFICER &&
            user.getRole() != Role.CPSB_ADMIN
        ) {
            throw new RuntimeException(
                "Only HR Officer or CPSB Admin can shortlist applicants"
            );
        }

        Applications application = applicationsRepo
            .findById(request.getApplicationId())
            .orElseThrow(() -> new RuntimeException("Application not found"));
        if (
            application.getApplicationStatus() != ApplicationState.SUBMITTED &&
            application.getApplicationStatus() != ApplicationState.UNDER_REVIEW
        ) {
            throw new RuntimeException(
                "Only SUBMITTED or UNDER_REVIEW applications can be shortlisted"
            );
        }
        Optional<Shortlist> existingShortlist = shortlistRepo.findByApplication(
            application
        );

        if (existingShortlist.isPresent()) {
            throw new RuntimeException(
                "Application has already been shortlisted"
            );
        }
        application.setApplicationStatus(ApplicationState.SHORTLISTED);

        applicationsRepo.save(application);

        // 7. Create shortlist record
        Shortlist shortlist = Shortlist.builder()
            .application(application)
            .shortlistedBy(user)
            .remarks(request.getRemarks())
            .build();

        Shortlist saved = shortlistRepo.save(shortlist);

        // Notify applicant
        Users applicantUser = application.getApplicant().getUser();
        notificationService.createNotification(
            applicantUser,
            "Application Shortlisted",
            "Congratulations! You have been shortlisted for " +
                application.getVacancy().getTitle() +
                "."
        );

        emailService.sendEmail(
            applicantUser.getEmail(),
            "Application update: shortlisted",
            "Hello " +
                applicantUser.getFName() +
                ",\n\n" +
                "Congratulations! You have been shortlisted for " +
                application.getVacancy().getTitle() +
                "." +
                (request.getRemarks() != null && !request.getRemarks().isBlank()
                    ? "\n\nRemarks: " + request.getRemarks()
                    : "") +
                "\n\nPlease keep checking your portal for the next steps."
        );

        return toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ShortlistResponseDTO> getShortlistByVacancy(Long vacancyId) {
        return shortlistRepo
            .findByApplication_Vacancy_Id(vacancyId)
            .stream()
            .map(this::toResponse)
            .toList();
    }

    private ShortlistResponseDTO toResponse(Shortlist shortlist) {
        Applications application = shortlist.getApplication();
        Applicant applicant = application.getApplicant();
        Users user = applicant.getUser();
        JobVacancy vacancy = application.getVacancy();

        return ShortlistResponseDTO.builder()
            .id(shortlist.getId())
            .applicationId(application.getId())
            .applicantName((user.getFName() + " " + user.getLName()).trim())
            .applicantEmail(user.getEmail())
            .applicantNationalId(applicant.getNationalId())
            .educationalLevel(applicant.getEducationalLevel())
            .yearsOfExperience(applicant.getYearsOfExperience())
            .vacancyTitle(vacancy.getTitle())
            .vacancyType(vacancy.getVacancyType())
            .departmentName(
                vacancy.getDepartment() != null
                    ? vacancy.getDepartment().getDepartmentName()
                    : null
            )
            .shortlistedDate(shortlist.getShortlistedDate())
            .remarks(shortlist.getRemarks())
            .build();
    }
}
