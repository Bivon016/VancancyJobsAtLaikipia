package com.CGL.cgl.Repo;

import com.CGL.cgl.Model.Applications;
import com.CGL.cgl.Model.Interview;
import com.CGL.cgl.Model.InterviewStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;


@Repository
public interface InterviewRepo extends JpaRepository<Interview, Long> {


    Optional<Interview> findByApplication(Applications application);


    List<Interview> findByStatus(InterviewStatus status);

}