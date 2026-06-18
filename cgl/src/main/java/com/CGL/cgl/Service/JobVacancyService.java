package com.CGL.cgl.Service;

import com.CGL.cgl.DTO.JobVacancyRequest;
import com.CGL.cgl.Model.*;
import com.CGL.cgl.Repo.JobVacancyRepo;
import com.CGL.cgl.Repo.RecruitmentRequestRepo;
import com.CGL.cgl.Repo.UserRepo;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class JobVacancyService {

    private final JobVacancyRepo jobVacancyRepo;
    private final RecruitmentRequestRepo recruitmentRequestRepo;
    private final UserRepo userRepo;

    public JobVacancyService (JobVacancyRepo jobVacancyRepo, RecruitmentRequestRepo recruitmentRequestRepo, UserRepo userRepo) {
        this.jobVacancyRepo = jobVacancyRepo;
        this.recruitmentRequestRepo = recruitmentRequestRepo;
        this.userRepo = userRepo;
    }

    public JobVacancy createVacancy(JobVacancyRequest request, String email) {

        Users createdBy = userRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        RecruitmentRequest recruitmentRequest = recruitmentRequestRepo
                .findById(request.getRecruitmentRequestId())
                .orElseThrow(() -> new RuntimeException("Recruitment request not found"));

        if (recruitmentRequest.getStatus() != Status.APPROVED) {
            throw new RuntimeException("Cannot create vacancy for unapproved request");
        }

        Departments department = recruitmentRequest.getDepartment();
        JobVacancy vacancy = JobVacancy.builder()
                .recruitmentRequest(recruitmentRequest)
                .department(department)
                .title(request.getTitle())
                .jobDescription(request.getJobDescription())
                .requirements(request.getRequirements())
                .salaryScale(request.getSalaryScale())
                .positionsAvailable(request.getPositionsAvailable())
                .status(ApplicationStatus.OPEN)
                .createdBy(createdBy)
                .build();

        return jobVacancyRepo.save(vacancy);
    }
    public List<JobVacancy> getAllOpenVacancies() {
        return jobVacancyRepo.findByStatus(ApplicationStatus.OPEN);
    }
    public JobVacancy getVacancyById(Long id) {
        return jobVacancyRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Vacancy not found"));


    }
    public JobVacancy closeVacancy(Long id) {
        JobVacancy vacancy = jobVacancyRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Vacancy not found"));

        vacancy.setStatus(ApplicationStatus.CLOSED);
        return jobVacancyRepo.save(vacancy);
    }


    public void deleteVacancyById(Long id) {
        jobVacancyRepo.deleteById(id);
    }


}




