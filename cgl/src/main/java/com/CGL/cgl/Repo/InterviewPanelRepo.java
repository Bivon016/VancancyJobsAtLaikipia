package com.CGL.cgl.Repo;

import com.CGL.cgl.Model.Interview;
import com.CGL.cgl.Model.InterviewPanel;
import com.CGL.cgl.Model.Users;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
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

    @Query("SELECT DISTINCT ip FROM InterviewPanel ip " +
            "LEFT JOIN FETCH ip.interview i " +
            "LEFT JOIN FETCH i.application a " +
            "LEFT JOIN FETCH a.applicant ap " +
            "LEFT JOIN FETCH ap.user " +
            "LEFT JOIN FETCH a.vacancy v " +
            "LEFT JOIN FETCH v.department " +
            "LEFT JOIN FETCH i.createdBy " +
            "WHERE ip.panelMember = :panelMember")
    List<InterviewPanel> findByPanelMemberWithDetails(@Param("panelMember") Users panelMember);

}