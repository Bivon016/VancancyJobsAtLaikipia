package com.CGL.cgl.Repo;

import com.CGL.cgl.Model.JobVacancy;
import com.CGL.cgl.Model.QuestionSet;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QuestionSetRepo extends JpaRepository<QuestionSet, Long> {
    List<QuestionSet> findByVacancy(JobVacancy vacancy);
    List<QuestionSet> findByVacancyAndPublished(JobVacancy vacancy, Boolean published);
    List<QuestionSet> findByPublished(Boolean published);
}