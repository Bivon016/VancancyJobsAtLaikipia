package com.CGL.cgl.Repo;

import com.CGL.cgl.Model.Assessment;
import com.CGL.cgl.Model.AssessmentQuestion;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AssessmentQuestionRepo extends JpaRepository<AssessmentQuestion, Long> {
    List<AssessmentQuestion> findByAssessmentOrderByOrderIndexAsc(Assessment assessment);
}
