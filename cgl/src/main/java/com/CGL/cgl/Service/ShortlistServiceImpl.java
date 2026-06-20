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


    public ShortlistServiceImpl(
            ShortlistRepo shortlistRepo,
            ApplicationsRepo applicationsRepo,
            UserRepo usersRepo
    ) {
        this.shortlistRepo = shortlistRepo;
        this.applicationsRepo = applicationsRepo;
        this.usersRepo = usersRepo;
    }


    @Override
    public Shortlist shortlistApplicant(
            ShortlistRequest request,
            String email
    ) {

        // 1. Get user from token
        Users user = usersRepo.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found")
                );

        // 2. Check role
        if (user.getRole() != Role.HR_OFFICER &&
                user.getRole() != Role.CPSB_ADMIN) {

            throw new RuntimeException(
                    "Only HR Officer or CPSB Admin can shortlist applicants"
            );
        }

        // 3. Fetch application
        Applications application =
                applicationsRepo.findById(request.getApplicationId())
                        .orElseThrow(() ->
                                new RuntimeException("Application not found")
                        );

        // 4. Check application status
        if (application.getApplicationStatus() != ApplicationState.SUBMITTED &&
                application.getApplicationStatus() != ApplicationState.UNDER_REVIEW) {

            throw new RuntimeException(
                    "Only SUBMITTED or UNDER_REVIEW applications can be shortlisted"
            );
        }

        // 5. Check not already shortlisted
        Optional<Shortlist> existingShortlist =
                shortlistRepo.findByApplication(application);

        if (existingShortlist.isPresent()) {
            throw new RuntimeException(
                    "Application has already been shortlisted"
            );
        }

        // 6. Update application status
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

        return shortlistRepo.save(shortlist);
    }
    @Override
    public List<Shortlist> getShortlistByVacancy(Long vacancyId) {
        return shortlistRepo.findByApplication_Vacancy_Id(vacancyId);
    }}