package com.CGL.cgl.Repo;

import com.CGL.cgl.Model.Assessment;
import com.CGL.cgl.Model.AssessmentStatus;
import com.CGL.cgl.Model.JobVacancy;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AssessmentRepo extends JpaRepository<Assessment, Long> {
    List<Assessment> findByVacancy(JobVacancy vacancy);
    List<Assessment> findByVacancyAndStatus(JobVacancy vacancy, AssessmentStatus status);
    Optional<Assessment> findByVacancyAndId(JobVacancy vacancy, Long id);
}
