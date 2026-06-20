package com.CGL.cgl.Repo;

import com.CGL.cgl.Model.JobVacancy;
import com.CGL.cgl.Model.VacancyRequirement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VacancyRequirementRepo extends JpaRepository<VacancyRequirement, Long> {

    List<VacancyRequirement> findByVacancy(JobVacancy vacancy);

}