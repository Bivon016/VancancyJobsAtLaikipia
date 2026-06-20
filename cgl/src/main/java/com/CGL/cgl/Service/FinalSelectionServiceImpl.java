package com.CGL.cgl.Service;

import com.CGL.cgl.DTO.FinalSelectionRequest;
import com.CGL.cgl.Model.*;
import com.CGL.cgl.Repo.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;


@Service
public class FinalSelectionServiceImpl implements FinalSelectionService {


    private final FinalSelectionRepo finalSelectionRepo;
    private final ApplicationsRepo applicationsRepo;
    private final UserRepo userRepo;
    private final JobVacancyRepo jobVacancyRepo;


    public FinalSelectionServiceImpl(
            FinalSelectionRepo finalSelectionRepo,
            ApplicationsRepo applicationsRepo,
            UserRepo userRepo,
            JobVacancyRepo jobVacancyRepo
    ) {

        this.finalSelectionRepo = finalSelectionRepo;
        this.applicationsRepo = applicationsRepo;
        this.userRepo = userRepo;
        this.jobVacancyRepo = jobVacancyRepo;

    }



    @Override
    @Transactional
    public FinalSelection selectCandidate(
            FinalSelectionRequest request,
            String email
    ) {


        // 1. Get logged in user
        Users user =
                userRepo.findByEmail(email)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "User not found"
                                )
                        );


        // 2. Check role
        if(user.getRole() != Role.CPSB_ADMIN){

            throw new RuntimeException(
                    "Only CPSB Admin can select candidates"
            );
        }



        // 3. Get application
        Applications application =
                applicationsRepo.findById(
                                request.getApplicationId()
                        )
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Application not found"
                                )
                        );



        // 4. Check application status
        if(application.getApplicationStatus()
                != ApplicationState.INTERVIEW){

            throw new RuntimeException(
                    "Only interviewed applicants can be selected"
            );
        }



        // 5. Check already selected
        Optional<FinalSelection> existing =
                finalSelectionRepo.findByApplication(
                        application
                );


        if(existing.isPresent()){

            throw new RuntimeException(
                    "Applicant already selected"
            );

        }



        // 6. Update application status
        application.setApplicationStatus(
                ApplicationState.SELECTED
        );


        applicationsRepo.save(application);



        // 7. Create selection
        FinalSelection selection =
                FinalSelection.builder()
                        .application(application)
                        .approvedBy(user)
                        .appointmentStatus(
                                AppointmentStatus
                                        .PENDING_APPOINTMENT
                        )
                        .remarks(
                                request.getRemarks()
                        )
                        .build();



        FinalSelection saved =
                finalSelectionRepo.save(selection);



        // 8. Check vacancy capacity

        JobVacancy vacancy =
                application.getVacancy();



        Long selectedCount =
                applicationsRepo
                        .countByVacancyAndApplicationStatus(
                                vacancy,
                                ApplicationState.SELECTED
                        );



        if(selectedCount >= vacancy.getPositionsAvailable()){


            vacancy.setStatus(
                    ApplicationStatus.FILLED
            );


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


        Users user =
                userRepo.findByEmail(email)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "User not found"
                                )
                        );


        if(user.getRole() != Role.CPSB_ADMIN){

            throw new RuntimeException(
                    "Only CPSB Admin can update appointment"
            );

        }



        FinalSelection selection =
                finalSelectionRepo.findById(selectionId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Selection not found"
                                )
                        );



        selection.setAppointmentStatus(status);



        return finalSelectionRepo.save(selection);

    }




    @Override
    public List<FinalSelection> getSelectionsByVacancy(
            Long vacancyId
    ) {


        return finalSelectionRepo
                .findByApplication_Vacancy_Id(
                        vacancyId
                );

    }

}