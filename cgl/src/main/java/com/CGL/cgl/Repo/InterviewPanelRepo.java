package com.CGL.cgl.Repo;

import com.CGL.cgl.Model.Interview;
import com.CGL.cgl.Model.InterviewPanel;
import com.CGL.cgl.Model.Users;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;


@Repository
public interface InterviewPanelRepo extends JpaRepository<InterviewPanel, Long> {


    List<InterviewPanel> findByInterview(Interview interview);

    void deleteByPanelMember(Users panelMember);

    boolean existsByInterviewAndPanelMember(
            Interview interview,
            Users panelMember
    );


    List<InterviewPanel> findByPanelMember(Users panelMember);

}