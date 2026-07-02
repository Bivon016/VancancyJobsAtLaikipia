package com.CGL.cgl.Repo;

import com.CGL.cgl.Model.ApplicantAnswer;
import com.CGL.cgl.Model.ApplicantAnswerScore;
import com.CGL.cgl.Model.OnlineInterview;
import com.CGL.cgl.Model.Users;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ApplicantAnswerScoreRepo extends JpaRepository<ApplicantAnswerScore, Long> {
    Optional<ApplicantAnswerScore> findByApplicantAnswerAndPanelMember(ApplicantAnswer applicantAnswer, Users panelMember);
    List<ApplicantAnswerScore> findByApplicantAnswer(ApplicantAnswer applicantAnswer);

    @org.springframework.data.jpa.repository.Query(
            "select s from ApplicantAnswerScore s where s.applicantAnswer.onlineInterview = :interview"
    )
    List<ApplicantAnswerScore> findByOnlineInterview(OnlineInterview interview);
}