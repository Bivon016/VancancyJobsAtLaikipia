package com.CGL.cgl.Service;

import com.CGL.cgl.DTO.ShortlistRequest;
import com.CGL.cgl.Model.*;
import com.CGL.cgl.Repo.*;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ShortlistServiceImpl implements ShortlistService {


    private final ShortlistRepo shortlistRepo;
    private final ApplicationsRepo applicationsRepo;
    private final UserRepo usersRepo;
    private final NotificationService notificationService;



    public ShortlistServiceImpl(
            ShortlistRepo shortlistRepo,
            ApplicationsRepo applicationsRepo,
            UserRepo usersRepo,NotificationService notificationService
    ) {
        this.shortlistRepo = shortlistRepo;
        this.applicationsRepo = applicationsRepo;
        this.usersRepo = usersRepo;
        this.notificationService = notificationService;
    }


    @Override
    public Shortlist shortlistApplicant(
            ShortlistRequest request,
            String email
    ) {
        Users user = usersRepo.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found")
                );

        if (user.getRole() != Role.HR_OFFICER &&
                user.getRole() != Role.CPSB_ADMIN) {

            throw new RuntimeException(
                    "Only HR Officer or CPSB Admin can shortlist applicants"
            );
        }

        Applications application =
                applicationsRepo.findById(request.getApplicationId())
                        .orElseThrow(() ->
                                new RuntimeException("Application not found")
                        );
        if (application.getApplicationStatus() != ApplicationState.SUBMITTED &&
                application.getApplicationStatus() != ApplicationState.UNDER_REVIEW) {
            throw new RuntimeException(
                    "Only SUBMITTED or UNDER_REVIEW applications can be shortlisted"
            );
        }
        Optional<Shortlist> existingShortlist =
                shortlistRepo.findByApplication(application);

        if (existingShortlist.isPresent()) {
            throw new RuntimeException(
                    "Application has already been shortlisted"
            );
        }
        application.setApplicationStatus(
                ApplicationState.SHORTLISTED
        );

        applicationsRepo.save(application);

        // 7. Create shortlist record
        Shortlist shortlist =
                Shortlist.builder()
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
                "Congratulations! You have been shortlisted for " + application.getVacancy().getTitle() + "."
        );

        return saved;
        }
    @Override
    public List<Shortlist> getShortlistByVacancy(Long vacancyId) {
        return shortlistRepo.findByApplication_Vacancy_Id(vacancyId);
    }}