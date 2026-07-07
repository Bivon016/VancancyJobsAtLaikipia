package com.CGL.cgl.Repo;

import com.CGL.cgl.Model.ApplicationStatus;
import com.CGL.cgl.Model.JobVacancy;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;


@Repository
public interface JobVacancyRepo extends JpaRepository<JobVacancy, Long> {
    List<JobVacancy> findByStatus(ApplicationStatus status);

    boolean existsByRecruitmentRequest_Id(Long recruitmentRequestId);

}
