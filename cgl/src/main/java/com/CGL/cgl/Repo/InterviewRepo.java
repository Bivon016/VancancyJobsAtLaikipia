package com.CGL.cgl.Repo;

import com.CGL.cgl.Model.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;


@Repository
public interface InterviewRepo extends JpaRepository<Interview, Long> {


    Optional<Interview> findByApplication(Applications application);


    List<Interview> findByStatus(InterviewStatus status);

    @Query("SELECT DISTINCT i FROM Interview i " +
            "LEFT JOIN FETCH i.application a " +
            "LEFT JOIN FETCH a.applicant ap " +
            "LEFT JOIN FETCH ap.user " +
            "LEFT JOIN FETCH a.vacancy v " +
            "LEFT JOIN FETCH v.department " +
            "LEFT JOIN FETCH i.createdBy " +
            "WHERE i.status = :status")
    List<Interview> findByStatusWithDetails(@Param("status") InterviewStatus status);


}