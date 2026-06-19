package com.CGL.cgl.Service;

import com.CGL.cgl.DTO.ApplicationsDTO;
import com.CGL.cgl.Model.*;
import com.CGL.cgl.Repo.ApplicantRepo;
import com.CGL.cgl.Repo.ApplicationsRepo;
import com.CGL.cgl.Repo.JobVacancyRepo;
import com.CGL.cgl.Repo.UserRepo;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;


@Service
public class ApplicationService {

    private final ApplicationsRepo applicationsRepo;
    private final UserRepo userRepo;
    private final ApplicantRepo applicantRepo;
    private final JobVacancyRepo jobVacancyRepo;

    public ApplicationService(ApplicationsRepo applicationsRepo, UserRepo userRepo, ApplicantRepo applicantRepo, JobVacancyRepo jobVacancyRepo) {
        this.applicationsRepo = applicationsRepo;
        this.userRepo = userRepo;
        this.applicantRepo = applicantRepo;
        this.jobVacancyRepo = jobVacancyRepo;
    }

    public Applications applyForJob(ApplicationsDTO request, String email) {
        Users user = userRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User does not exist"));

        Applicant applicant = applicantRepo.findByUser(user)
                .orElseThrow(() -> new RuntimeException("User profile not found"));


        JobVacancy vacancy = jobVacancyRepo.findById(request.getVacancyId())
                .orElseThrow(() -> new RuntimeException("Job vacancy not found"));

        if (vacancy.getStatus() != ApplicationStatus.OPEN) {
            throw new RuntimeException("Job vacancy is not open");
        }
        if (applicationsRepo.findByApplicantAndVacancy(applicant, vacancy).isPresent()) {
            throw new RuntimeException("You have already applied");
        }

        Applications application = Applications.builder()
                .applicant(applicant)
                .vacancy(vacancy)
                .applicationDate(LocalDateTime.now())
                .applicationStatus(ApplicationState.SUBMITTED)
                .build();
        return applicationsRepo.save(application);
    }

    public List<Applications> getMyApplications(String email) {
        Users user = userRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Applicant applicant = applicantRepo.findByUser(user)
                .orElseThrow(() -> new RuntimeException("Profile not found"));
        return applicationsRepo.findByApplicant(applicant);
    }

    public Applications updateStatus(Long applicationId, ApplicationState status, String remarks) {
        Applications application = applicationsRepo.findById(applicationId)
                .orElseThrow(() -> new RuntimeException("Application not found"));

        application.setApplicationStatus(status);
        application.setRemarks(remarks);

        return applicationsRepo.save(application);
    }
    public List<Applications> getAllApplicationsForVacancy(Long vacancyId) {
        JobVacancy vacancy = jobVacancyRepo.findById(vacancyId)
                .orElseThrow(() -> new RuntimeException("Vacancy not found"));
        return applicationsRepo.findByVacancy(vacancy);
    }

    public List<Applications> getAllApplications() {
        return applicationsRepo.findAll();

    }

}



