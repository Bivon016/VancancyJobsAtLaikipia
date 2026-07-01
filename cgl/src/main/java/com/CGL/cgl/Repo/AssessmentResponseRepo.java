package com.CGL.cgl.Repo;

import com.CGL.cgl.Model.Assessment;
import com.CGL.cgl.Model.AssessmentResponse;
import com.CGL.cgl.Model.Users;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AssessmentResponseRepo extends JpaRepository<AssessmentResponse, Long> {
    boolean existsByAssessmentAndApplicant(Assessment assessment, Users applicant);
    List<AssessmentResponse> findByAssessment(Assessment assessment);
    Optional<AssessmentResponse> findByAssessmentAndApplicant(Assessment assessment, Users applicant);
}
