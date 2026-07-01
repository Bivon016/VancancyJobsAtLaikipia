package com.CGL.cgl.Repo;

import com.CGL.cgl.Model.AssessmentAnswer;
import com.CGL.cgl.Model.AssessmentResponse;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AssessmentAnswerRepo extends JpaRepository<AssessmentAnswer, Long> {
    List<AssessmentAnswer> findByResponse(AssessmentResponse response);
}
