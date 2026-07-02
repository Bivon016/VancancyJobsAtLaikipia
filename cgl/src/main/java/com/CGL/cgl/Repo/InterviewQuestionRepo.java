package com.CGL.cgl.Repo;

import com.CGL.cgl.Model.InterviewQuestion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface InterviewQuestionRepo extends JpaRepository<InterviewQuestion, Long> {
}