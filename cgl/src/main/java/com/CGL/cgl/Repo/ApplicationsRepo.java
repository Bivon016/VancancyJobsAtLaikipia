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
    Long countByVacancyAndApplicationStatus(JobVacancy vacancy, ApplicationState applicationStatus);

}
