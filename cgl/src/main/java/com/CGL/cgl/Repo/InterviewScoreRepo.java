package com.CGL.cgl.Repo;

import com.CGL.cgl.Model.Interview;
import com.CGL.cgl.Model.InterviewScore;
import com.CGL.cgl.Model.Users;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InterviewScoreRepo
        extends JpaRepository<InterviewScore, Long> {

    Optional<InterviewScore> findByInterviewAndPanelMember(
            Interview interview,
            Users panelMember
    );

    List<InterviewScore> findByInterview(
            Interview interview
    );
}