package com.CGL.cgl.Service;

import com.CGL.cgl.DTO.ApplicantProfileRequest;
import com.CGL.cgl.DTO.ApplicantProfileResponse;
import com.CGL.cgl.Exception.ConflictException;
import com.CGL.cgl.Exception.ForbiddenException;
import com.CGL.cgl.Exception.ResourceNotFoundException;
import com.CGL.cgl.Model.Applicant;
import com.CGL.cgl.Model.Role;
import com.CGL.cgl.Model.Users;
import com.CGL.cgl.Repo.ApplicantRepo;
import com.CGL.cgl.Repo.UserRepo;
import java.time.Year;
import org.springframework.stereotype.Service;

@Service
public class ApplicantService {

    private final ApplicantRepo applicantRepo;
    private final UserRepo userRepo;

    public ApplicantService(ApplicantRepo applicantRepo, UserRepo userRepo) {
        this.applicantRepo = applicantRepo;
        this.userRepo = userRepo;
    }

    public ApplicantProfileResponse createProfile(
        ApplicantProfileRequest request,
        String email
    ) {
        Users users = userRepo
            .findByEmail(email)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (applicantRepo.findByUser(users).isPresent()) {
            throw new ConflictException("Profile already exists for this user");
        }

        if (
            applicantRepo.findByNationalId(request.getNationalId()).isPresent()
        ) {
            throw new ConflictException("National ID already registered");
        }

        if (users.getRole() != Role.APPLICANT) {
            throw new ForbiddenException(
                "Only applicants can create a profile"
            );
        }

        validateProfileRequest(request);

        Applicant applicant = Applicant.builder()
            .user(users)
            .nationalId(request.getNationalId())
            .birthDate(request.getBirthDate())
            .gender(request.getGender())
            .maritalStatus(request.getMaritalStatus())
            .nationality(request.getNationality())
            .postalAddress(request.getPostalAddress())
            .physicalAddress(request.getPhysicalAddress())
            .countyOfBirth(request.getCountyOfBirth())
            .countyOfResidence(request.getCountyOfResidence())
            .subCounty(request.getSubCounty())
            .ward(request.getWard())
            .village(request.getVillage())
            .disabilityStatus(request.getDisabilityStatus())
            .disabilityType(normalizeDisabilityType(request))
            .disabilityRegistrationNumber(
                normalizeDisabilityRegistrationNumber(request)
            )
            .ethnicity(request.getEthnicity())
            .educationalLevel(request.getEducationalLevel())
            .educationYearOfCompletion(request.getEducationYearOfCompletion())
            .yearsOfExperience(request.getYearsOfExperience())
            .currentProfession(request.getCurrentProfession())
            .profileCompleted(true)
            .build();

        return toResponse(applicantRepo.save(applicant));
    }

    public ApplicantProfileResponse updateProfile(
        ApplicantProfileRequest request,
        String email
    ) {
        Users users = userRepo
            .findByEmail(email)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Applicant applicant = applicantRepo
            .findByUser(users)
            .orElseThrow(() ->
                new ResourceNotFoundException("Profile not found")
            );

        validateProfileRequest(request);

        if (
            request.getNationalId() != null &&
            !request.getNationalId().equals(applicant.getNationalId())
        ) {
            applicantRepo
                .findByNationalId(request.getNationalId())
                .ifPresent(existing -> {
                    if (!existing.getId().equals(applicant.getId())) {
                        throw new ConflictException(
                            "National ID already registered"
                        );
                    }
                });
            applicant.setNationalId(request.getNationalId());
        }
        if (request.getBirthDate() != null) {
            applicant.setBirthDate(request.getBirthDate());
        }
        if (request.getGender() != null) {
            applicant.setGender(request.getGender());
        }
        if (request.getMaritalStatus() != null) {
            applicant.setMaritalStatus(request.getMaritalStatus());
        }
        if (request.getNationality() != null) {
            applicant.setNationality(request.getNationality());
        }
        if (request.getPostalAddress() != null) {
            applicant.setPostalAddress(request.getPostalAddress());
        }
        if (request.getPhysicalAddress() != null) {
            applicant.setPhysicalAddress(request.getPhysicalAddress());
        }
        if (request.getCountyOfBirth() != null) {
            applicant.setCountyOfBirth(request.getCountyOfBirth());
        }
        if (request.getCountyOfResidence() != null) {
            applicant.setCountyOfResidence(request.getCountyOfResidence());
        }
        if (request.getSubCounty() != null) {
            applicant.setSubCounty(request.getSubCounty());
        }
        if (request.getWard() != null) {
            applicant.setWard(request.getWard());
        }
        if (request.getVillage() != null) {
            applicant.setVillage(request.getVillage());
        }
        if (request.getDisabilityStatus() != null) {
            applicant.setDisabilityStatus(request.getDisabilityStatus());
        }
        applicant.setDisabilityType(normalizeDisabilityType(request));
        applicant.setDisabilityRegistrationNumber(
            normalizeDisabilityRegistrationNumber(request)
        );
        if (request.getEthnicity() != null) {
            applicant.setEthnicity(request.getEthnicity());
        }
        if (request.getEducationalLevel() != null) {
            applicant.setEducationalLevel(request.getEducationalLevel());
        }
        if (request.getEducationYearOfCompletion() != null) {
            applicant.setEducationYearOfCompletion(
                request.getEducationYearOfCompletion()
            );
        }
        if (request.getYearsOfExperience() != null) {
            applicant.setYearsOfExperience(request.getYearsOfExperience());
        }
        if (request.getCurrentProfession() != null) {
            applicant.setCurrentProfession(request.getCurrentProfession());
        }

        return toResponse(applicantRepo.save(applicant));
    }

    public ApplicantProfileResponse updateProfileByUserId(
        ApplicantProfileRequest request,
        Long userId
    ) {
        Users users = userRepo
            .findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Applicant applicant = applicantRepo
            .findByUser(users)
            .orElseThrow(() ->
                new ResourceNotFoundException("Applicant profile not found")
            );

        validateProfileRequest(request);

        if (
            request.getNationalId() != null &&
            !request.getNationalId().equals(applicant.getNationalId())
        ) {
            applicantRepo
                .findByNationalId(request.getNationalId())
                .ifPresent(existing -> {
                    if (!existing.getId().equals(applicant.getId())) {
                        throw new ConflictException(
                            "National ID already registered"
                        );
                    }
                });
            applicant.setNationalId(request.getNationalId());
        }
        if (request.getBirthDate() != null) {
            applicant.setBirthDate(request.getBirthDate());
        }
        if (request.getGender() != null) {
            applicant.setGender(request.getGender());
        }
        if (request.getMaritalStatus() != null) {
            applicant.setMaritalStatus(request.getMaritalStatus());
        }
        if (request.getNationality() != null) {
            applicant.setNationality(request.getNationality());
        }
        if (request.getPostalAddress() != null) {
            applicant.setPostalAddress(request.getPostalAddress());
        }
        if (request.getPhysicalAddress() != null) {
            applicant.setPhysicalAddress(request.getPhysicalAddress());
        }
        if (request.getCountyOfBirth() != null) {
            applicant.setCountyOfBirth(request.getCountyOfBirth());
        }
        if (request.getCountyOfResidence() != null) {
            applicant.setCountyOfResidence(request.getCountyOfResidence());
        }
        if (request.getSubCounty() != null) {
            applicant.setSubCounty(request.getSubCounty());
        }
        if (request.getWard() != null) {
            applicant.setWard(request.getWard());
        }
        if (request.getVillage() != null) {
            applicant.setVillage(request.getVillage());
        }
        if (request.getDisabilityStatus() != null) {
            applicant.setDisabilityStatus(request.getDisabilityStatus());
        }
        applicant.setDisabilityType(normalizeDisabilityType(request));
        applicant.setDisabilityRegistrationNumber(
            normalizeDisabilityRegistrationNumber(request)
        );
        if (request.getEthnicity() != null) {
            applicant.setEthnicity(request.getEthnicity());
        }
        if (request.getEducationalLevel() != null) {
            applicant.setEducationalLevel(request.getEducationalLevel());
        }
        if (request.getEducationYearOfCompletion() != null) {
            applicant.setEducationYearOfCompletion(
                request.getEducationYearOfCompletion()
            );
        }
        if (request.getYearsOfExperience() != null) {
            applicant.setYearsOfExperience(request.getYearsOfExperience());
        }
        if (request.getCurrentProfession() != null) {
            applicant.setCurrentProfession(request.getCurrentProfession());
        }

        return toResponse(applicantRepo.save(applicant));
    }

    public ApplicantProfileResponse getProfile(String email) {
        Users users = userRepo
            .findByEmail(email)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        Applicant applicant = applicantRepo
            .findByUser(users)
            .orElseThrow(() ->
                new ResourceNotFoundException("Profile not found")
            );
        return toResponse(applicant);
    }

    private ApplicantProfileResponse toResponse(Applicant applicant) {
        return ApplicantProfileResponse.builder()
            .id(applicant.getId())
            .userId(applicant.getUser().getId())
            .email(applicant.getUser().getEmail())
            .nationalId(applicant.getNationalId())
            .birthDate(applicant.getBirthDate())
            .gender(applicant.getGender())
            .maritalStatus(applicant.getMaritalStatus())
            .nationality(applicant.getNationality())
            .postalAddress(applicant.getPostalAddress())
            .physicalAddress(applicant.getPhysicalAddress())
            .countyOfBirth(applicant.getCountyOfBirth())
            .countyOfResidence(applicant.getCountyOfResidence())
            .subCounty(applicant.getSubCounty())
            .ward(applicant.getWard())
            .village(applicant.getVillage())
            .disabilityStatus(applicant.getDisabilityStatus())
            .disabilityType(applicant.getDisabilityType())
            .disabilityRegistrationNumber(
                applicant.getDisabilityRegistrationNumber()
            )
            .ethnicity(applicant.getEthnicity())
            .educationalLevel(applicant.getEducationalLevel())
            .educationYearOfCompletion(applicant.getEducationYearOfCompletion())
            .yearsOfExperience(applicant.getYearsOfExperience())
            .currentProfession(applicant.getCurrentProfession())
            .profileCompleted(applicant.getProfileCompleted())
            .createdAt(applicant.getCreatedAt())
            .build();
    }

    private void validateProfileRequest(ApplicantProfileRequest request) {
        if (Boolean.TRUE.equals(request.getDisabilityStatus())) {
            if (isBlank(request.getDisabilityType())) {
                throw new ConflictException(
                    "Disability type is required when disability status is yes"
                );
            }
        }

        if (isBlank(request.getEducationalLevel())) {
            throw new ConflictException("Education type is required");
        }

        Integer currentYear = Year.now().getValue();
        Integer educationYear = request.getEducationYearOfCompletion();
        if (educationYear == null) {
            throw new ConflictException(
                "Education year of completion is required"
            );
        }
        if (educationYear < 1950 || educationYear > currentYear + 1) {
            throw new ConflictException(
                "Education year of completion is invalid"
            );
        }
    }

    private String normalizeDisabilityType(ApplicantProfileRequest request) {
        if (!Boolean.TRUE.equals(request.getDisabilityStatus())) {
            return null;
        }
        return request.getDisabilityType() == null
            ? null
            : request.getDisabilityType().trim();
    }

    private String normalizeDisabilityRegistrationNumber(
        ApplicantProfileRequest request
    ) {
        if (!Boolean.TRUE.equals(request.getDisabilityStatus())) {
            return null;
        }
        return request.getDisabilityRegistrationNumber() == null
            ? null
            : request.getDisabilityRegistrationNumber().trim();
    }

    private boolean isBlank(String value) {
        return value == null || value.trim().isEmpty();
    }
}
