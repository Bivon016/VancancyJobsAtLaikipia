package com.CGL.cgl.Repo;

import com.CGL.cgl.Model.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InterviewQuestionRepo extends JpaRepository<InterviewQuestion, Long> {

    List<InterviewQuestion> findByInterview(Interview interview);

    List<InterviewQuestion> findByInterviewAndStatus(Interview interview, QuestionStatus status);

    List<InterviewQuestion> findByCreatedBy(Users createdBy);

    @Query("SELECT DISTINCT q FROM InterviewQuestion q " +
            "LEFT JOIN FETCH q.interview i " +
            "LEFT JOIN FETCH i.application a " +
            "LEFT JOIN FETCH a.applicant ap " +
            "LEFT JOIN FETCH ap.user " +
            "LEFT JOIN FETCH q.createdBy " +
            "WHERE q.interview = :interview " +
            "ORDER BY q.createdAt ASC")
    List<InterviewQuestion> findByInterviewWithDetails(@Param("interview") Interview interview);

    @Query("SELECT DISTINCT q FROM InterviewQuestion q " +
            "LEFT JOIN FETCH q.createdBy " +
            "LEFT JOIN FETCH q.interview i " +
            "WHERE q.vacancy = :vacancy AND q.interview IS NULL " +
            "ORDER BY q.createdAt ASC")
    List<InterviewQuestion> findVacancyQuestionsWithDetails(@Param("vacancy") JobVacancy vacancy);

    @Query("SELECT DISTINCT q FROM InterviewQuestion q " +
            "LEFT JOIN FETCH q.createdBy " +
            "LEFT JOIN FETCH q.interview i " +
            "LEFT JOIN FETCH i.application a " +
            "LEFT JOIN FETCH a.applicant ap " +
            "LEFT JOIN FETCH ap.user " +
            "WHERE (q.interview = :interview OR (q.vacancy = :vacancy AND q.interview IS NULL)) " +
            "ORDER BY q.createdAt ASC")
    List<InterviewQuestion> findForInterviewOrVacancy(@Param("interview") Interview interview,
                                                     @Param("vacancy") JobVacancy vacancy);
}