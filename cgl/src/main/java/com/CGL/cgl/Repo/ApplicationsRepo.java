package com.CGL.cgl.Repo;

import com.CGL.cgl.Model.Applicant;
import com.CGL.cgl.Model.ApplicationState;
import com.CGL.cgl.Model.Applications;
import com.CGL.cgl.Model.JobVacancy;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ApplicationsRepo extends JpaRepository<Applications, Long> {
    Optional<Applications> findByApplicantAndVacancy(Applicant applicant, JobVacancy vacancy);
    List<Applications> findByVacancy(JobVacancy vacancy);
    List<Applications> findByApplicant(Applicant applicant);
    List<Applications> findByVacancyAndApplicationStatus(JobVacancy vacancy, ApplicationState applicationStatus);
    Long countByVacancyAndApplicationStatus(JobVacancy vacancy, ApplicationState applicationStatus);

    // "Mark as done" support: default HR/Admin views only show open (not-yet-closed)
    // applications; closed ones are still reachable via the includeClosed=true views.
    List<Applications> findByClosed(boolean closed);
    List<Applications> findByVacancyAndClosed(JobVacancy vacancy, boolean closed);
}