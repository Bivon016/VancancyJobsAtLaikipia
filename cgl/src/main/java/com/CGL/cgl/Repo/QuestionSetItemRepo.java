package com.CGL.cgl.Repo;

import com.CGL.cgl.Model.InterviewQuestion;
import com.CGL.cgl.Model.QuestionSet;
import com.CGL.cgl.Model.QuestionSetItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface QuestionSetItemRepo extends JpaRepository<QuestionSetItem, Long> {
    List<QuestionSetItem> findByQuestionSetOrderByOrderIndexAsc(QuestionSet questionSet);
    Optional<QuestionSetItem> findByQuestionSetAndQuestion(QuestionSet questionSet, InterviewQuestion question);
    int countByQuestionSet(QuestionSet questionSet);
}

