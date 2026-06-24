package com.CGL.cgl.Service;

import com.CGL.cgl.DTO.InterviewRequest;
import com.CGL.cgl.DTO.PanelMemberRequest;
import com.CGL.cgl.Model.*;
import com.CGL.cgl.Repo.*;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class InterviewServiceImpl implements InterviewService {

    private final InterviewRepo interviewRepo;
    private final InterviewPanelRepo interviewPanelRepo;
    private final ApplicationsRepo applicationsRepo;
    private final UserRepo usersRepo;
    private final NotificationService notificationService;
    private final EmailService emailService;

    public InterviewServiceImpl(
        InterviewRepo interviewRepo,
        InterviewPanelRepo interviewPanelRepo,
        ApplicationsRepo applicationsRepo,
        UserRepo usersRepo,
        NotificationService notificationService,
        EmailService emailService
    ) {
        this.interviewRepo = interviewRepo;
        this.interviewPanelRepo = interviewPanelRepo;
        this.applicationsRepo = applicationsRepo;
        this.usersRepo = usersRepo;
        this.notificationService = notificationService;
        this.emailService = emailService;
    }

    @Override
    @Transactional
    public Interview scheduleInterview(InterviewRequest request, String email) {
        // 1. Get user from token
        Users user = usersRepo
            .findByEmail(email)
            .orElseThrow(() -> new RuntimeException("User not found"));

        // 2. Fetch application
        Applications application = applicationsRepo
            .findById(request.getApplicationId())
            .orElseThrow(() -> new RuntimeException("Application not found"));

        // 3. Application must be SHORTLISTED
        if (
            application.getApplicationStatus() != ApplicationState.SHORTLISTED
        ) {
            throw new RuntimeException(
                "Only shortlisted applications can get interviews"
            );
        }

        // 4. Check interview already exists
        if (interviewRepo.findByApplication(application).isPresent()) {
            throw new RuntimeException("Interview already scheduled");
        }

        // 5. Build interview
        Interview interview = Interview.builder()
            .application(application)
            .interviewDate(request.getInterviewDate())
            .interviewTime(request.getInterviewTime())
            .venue(request.getVenue())
            .status(InterviewStatus.SCHEDULED)
            .createdBy(user)
            .build();

        application.setApplicationStatus(ApplicationState.INTERVIEW);

        applicationsRepo.save(application);

        Interview saved = interviewRepo.save(interview);

        Users applicantUser = application.getApplicant().getUser();
        String interviewMessage =
            "You have an interview scheduled on " +
            request.getInterviewDate() +
            " at " +
            request.getInterviewTime() +
            ", venue: " +
            request.getVenue() +
            ".";

        notificationService.createNotification(
            applicantUser,
            "Interview Invitation",
            interviewMessage
        );

        String referenceNo = String.valueOf(application.getId());
        String departmentName = application.getVacancy().getDepartment() != null
            ? application.getVacancy().getDepartment().getDepartmentName()
            : "Laikipia County";

        String htmlBody = EmailTemplates.interviewScheduled(
            applicantUser.getFName(),
            application.getVacancy().getTitle(),
            departmentName,
            referenceNo,
            request.getInterviewDate().toString(),
            request.getInterviewTime().toString(),
            request.getVenue()
        );

        emailService.sendHtmlEmail(
            applicantUser.getEmail(),
            "Interview invitation",
            htmlBody
        );

        return saved;
    }

    @Override
    @Transactional
    public void addPanelMember(PanelMemberRequest request, String email) {
        Interview interview = interviewRepo
            .findById(request.getInterviewId())
            .orElseThrow(() -> new RuntimeException("Interview not found"));

        Users panelMember = usersRepo
            .findById(request.getPanelMemberId())
            .orElseThrow(() -> new RuntimeException("Panel member not found"));

        // check role
        if (panelMember.getRole() != Role.PANEL_MEMBER) {
            throw new RuntimeException("User is not a panel member");
        }

        // prevent duplicate
        if (
            interviewPanelRepo.existsByInterviewAndPanelMember(
                interview,
                panelMember
            )
        ) {
            throw new RuntimeException("Panel member already assigned");
        }

        InterviewPanel panel = InterviewPanel.builder()
            .interview(interview)
            .panelMember(panelMember)
            .build();

        interviewPanelRepo.save(panel);
    }

    @Override
    public List<Interview> getInterviewsByStatus(InterviewStatus status) {
        return interviewRepo.findByStatus(status);
    }

    @Override
    public List<Interview> getMyInterviews(String email) {
        Users user = usersRepo
            .findByEmail(email)
            .orElseThrow(() -> new RuntimeException("User not found"));

        List<InterviewPanel> panels = interviewPanelRepo.findByPanelMember(
            user
        );

        return panels.stream().map(InterviewPanel::getInterview).toList();
    }

    @Override
    @Transactional
    public Interview completeInterview(Long interviewId, String email) {
        Interview interview = interviewRepo
            .findById(interviewId)
            .orElseThrow(() -> new RuntimeException("Interview not found"));

        interview.setStatus(InterviewStatus.COMPLETED);

        return interviewRepo.save(interview);
    }
}
