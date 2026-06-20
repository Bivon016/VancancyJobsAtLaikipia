package com.CGL.cgl.Service;

import com.CGL.cgl.DTO.InterviewRequest;
import com.CGL.cgl.DTO.PanelMemberRequest;
import com.CGL.cgl.Model.Interview;
import com.CGL.cgl.Model.InterviewStatus;

import java.util.List;


public interface InterviewService {


    Interview scheduleInterview(
            InterviewRequest request,
            String email
    );


    void addPanelMember(
            PanelMemberRequest request,
            String email
    );


    List<Interview> getInterviewsByStatus(
            InterviewStatus status
    );


    List<Interview> getMyInterviews(
            String email
    );


    Interview completeInterview(
            Long interviewId,
            String email
    );

}