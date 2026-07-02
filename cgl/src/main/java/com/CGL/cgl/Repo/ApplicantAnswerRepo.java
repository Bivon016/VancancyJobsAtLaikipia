package com.CGL.cgl.Repo;

import com.CGL.cgl.Model.ApplicantAnswer;
import com.CGL.cgl.Model.OnlineInterview;
import com.CGL.cgl.Model.QuestionSetItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ApplicantAnswerRepo extends JpaRepository<ApplicantAnswer, Long> {
    Optional<ApplicantAnswer> findByOnlineInterviewAndQuestionSetItem(OnlineInterview onlineInterview, QuestionSetItem questionSetItem);
    List<ApplicantAnswer> findByOnlineInterview(OnlineInterview onlineInterview);
}