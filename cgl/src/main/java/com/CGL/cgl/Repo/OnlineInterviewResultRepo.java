package com.CGL.cgl.Repo;

import com.CGL.cgl.Model.JobVacancy;
import com.CGL.cgl.Model.OnlineInterview;
import com.CGL.cgl.Model.OnlineInterviewResult;
import com.CGL.cgl.Model.Recommendation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OnlineInterviewResultRepo extends JpaRepository<OnlineInterviewResult, Long> {
    Optional<OnlineInterviewResult> findByOnlineInterview(OnlineInterview onlineInterview);

    @Query("select r from OnlineInterviewResult r " +
            "where r.onlineInterview.application.vacancy = :vacancy " +
            "order by r.averageScore desc")
    List<OnlineInterviewResult> findByVacancy(@Param("vacancy") JobVacancy vacancy);

    @Query("select r from OnlineInterviewResult r " +
            "where r.onlineInterview.application.vacancy = :vacancy and r.recommendation = :recommendation " +
            "order by r.averageScore desc")
    List<OnlineInterviewResult> findByVacancyAndRecommendation(
            @Param("vacancy") JobVacancy vacancy, @Param("recommendation") Recommendation recommendation);

    @Query("select r from OnlineInterviewResult r order by r.finalizedAt desc")
    List<OnlineInterviewResult> findAllOrderByFinalizedAtDesc();
}