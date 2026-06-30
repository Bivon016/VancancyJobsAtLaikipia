package com.CGL.cgl.Repo;

import com.CGL.cgl.Model.Interview;
import com.CGL.cgl.Model.InterviewAnswer;
import com.CGL.cgl.Model.InterviewQuestion;
import com.CGL.cgl.Model.Users;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InterviewAnswerRepo extends JpaRepository<InterviewAnswer, Long> {

    boolean existsByQuestion(InterviewQuestion question);

    Optional<InterviewAnswer> findByQuestion(InterviewQuestion question);

    List<InterviewAnswer> findByInterview(Interview interview);

    List<InterviewAnswer> findByInterviewAndApplicant(Interview interview, Users applicant);
}