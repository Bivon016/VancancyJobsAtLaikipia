package com.CGL.cgl.Service;

import com.CGL.cgl.DTO.ApplicantProfileRequest;
import com.CGL.cgl.Model.Applicant;
import com.CGL.cgl.Model.Role;
import com.CGL.cgl.Model.Users;
import com.CGL.cgl.Repo.ApplicantRepo;
import com.CGL.cgl.Repo.UserRepo;
import org.springframework.stereotype.Service;


@Service
public class ApplicantService {

    private final ApplicantRepo applicantRepo;
    private final UserRepo userRepo;

    public ApplicantService(ApplicantRepo applicantRepo, UserRepo userRepo) {
        this.applicantRepo = applicantRepo;
        this.userRepo = userRepo;
    }

    public Applicant createProfile(ApplicantProfileRequest request, String email) {
        Users users = userRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (applicantRepo.findByUser(users).isPresent()) {
            throw new RuntimeException("Profile already exists for this user");
        }

        if (applicantRepo.findByNationalId(request.getNationalId()).isPresent()) {
            throw new RuntimeException("National ID already registered");
        }

        if (users.getRole() != Role.APPLICANT) {
            throw new RuntimeException("Only applicants can create a profile");
        }

        Applicant applicant = Applicant.builder()
                .user(users)
                .nationalId(request.getNationalId())
                .birthDate(request.getDateOfBirth())
                .gender(request.getGender())
                .county(request.getCounty())
                .educationalLevel(request.getEducationalLevel())
                .yearsOfExperience(request.getYearsOfExperience())
                .build();

        return applicantRepo.save(applicant);
    }


    public Applicant updateProfile(ApplicantProfileRequest request, String email) {
            Users users = userRepo.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            Applicant applicant = applicantRepo.findByUser(users)
                    .orElseThrow(() -> new RuntimeException("Profile not found"));

        if (request.getNationalId() != null) {
            applicant.setNationalId(request.getNationalId());
        }
        if(request.getDateOfBirth()!= null){
            applicant.setBirthDate(request.getDateOfBirth());
        }
        if(request.getGender() != null){
            applicant.setGender(request.getGender());
        }
        if(request.getCounty() != null){
            applicant.setCounty(request.getCounty());
        }
        if(request.getEducationalLevel() != null){
            applicant.setEducationalLevel(request.getEducationalLevel());
        }
        if(request.getYearsOfExperience() != null){
            applicant.setYearsOfExperience(request.getYearsOfExperience());
        }
        return applicantRepo.save(applicant);
    }
    public Applicant getProfile(String email) {
        Users users = userRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return applicantRepo.findByUser(users)
                .orElseThrow(() -> new RuntimeException("Profile not found"));
    }
}
