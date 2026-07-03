package com.CGL.cgl.Repo;

import com.CGL.cgl.Model.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OnlineInterviewRepo extends JpaRepository<OnlineInterview, Long> {
    Optional<OnlineInterview> findByApplication(Applications application);
    Optional<OnlineInterview> findByInterviewToken(String interviewToken);
    List<OnlineInterview> findByApplication_Applicant(Applicant applicant);
    List<OnlineInterview> findByApplication_Vacancy(JobVacancy vacancy);
    List<OnlineInterview> findByApplication_VacancyAndStatus(JobVacancy vacancy, OnlineInterviewStatus status);
    List<OnlineInterview> findByStatus(OnlineInterviewStatus status);
}