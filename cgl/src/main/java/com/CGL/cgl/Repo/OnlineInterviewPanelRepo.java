package com.CGL.cgl.Repo;

import com.CGL.cgl.Model.OnlineInterview;
import com.CGL.cgl.Model.OnlineInterviewPanel;
import com.CGL.cgl.Model.Users;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OnlineInterviewPanelRepo extends JpaRepository<OnlineInterviewPanel, Long> {

    List<OnlineInterviewPanel> findByOnlineInterview(OnlineInterview onlineInterview);

    void deleteByPanelMember(Users panelMember);

    boolean existsByOnlineInterviewAndPanelMember(
            OnlineInterview onlineInterview,
            Users panelMember
    );

    List<OnlineInterviewPanel> findByPanelMember(Users panelMember);
}
