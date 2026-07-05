package com.CGL.cgl.Service;

import com.CGL.cgl.DTO.ApplicantAnswerScoreResponse;
import com.CGL.cgl.DTO.SubmitScoreRequest;
import com.CGL.cgl.Model.*;
import com.CGL.cgl.Repo.ApplicantAnswerRepo;
import com.CGL.cgl.Repo.ApplicantAnswerScoreRepo;
import com.CGL.cgl.Repo.UserRepo;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ApplicantAnswerScoreService {

    private final ApplicantAnswerScoreRepo scoreRepo;
    private final ApplicantAnswerRepo applicantAnswerRepo;
    private final UserRepo userRepo;

    public ApplicantAnswerScoreService(ApplicantAnswerScoreRepo scoreRepo, ApplicantAnswerRepo applicantAnswerRepo,
                                       UserRepo userRepo) {
        this.scoreRepo = scoreRepo;
        this.applicantAnswerRepo = applicantAnswerRepo;
        this.userRepo = userRepo;
    }

    @Transactional
    public ApplicantAnswerScoreResponse submitScore(SubmitScoreRequest request, String email) {
        Users panelMember = userRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (panelMember.getRole() != Role.PANEL_MEMBER && panelMember.getRole() != Role.SUPER_ADMIN) {
            throw new RuntimeException("You are not allowed to perform this action!");
        }


        ApplicantAnswer answer = applicantAnswerRepo.findById(request.getApplicantAnswerId())
                .orElseThrow(() -> new RuntimeException("Applicant answer not found"));


        if (answer.getOnlineInterview().getStatus() != OnlineInterviewStatus.SUBMITTED
                && answer.getOnlineInterview().getStatus() != OnlineInterviewStatus.EVALUATED) {
            throw new RuntimeException("Cannot score an interview before it has been submitted");
        }

        if (request.getMarksAwarded() == null || request.getMarksAwarded() < 0) {
            throw new RuntimeException("Marks awarded must be zero or greater");
        }

        Integer maxMarks = answer.getQuestionSetItem().getMarks();
        if (maxMarks != null && request.getMarksAwarded() > maxMarks) {
            throw new RuntimeException("Marks awarded cannot exceed the question's max marks (" + maxMarks + ")");
        }

        ApplicantAnswerScore score = scoreRepo
                .findByApplicantAnswerAndPanelMember(answer, panelMember)
                .orElse(ApplicantAnswerScore.builder()
                        .applicantAnswer(answer)
                        .panelMember(panelMember)
                        .build());

        score.setMarksAwarded(request.getMarksAwarded());
        score.setComment(request.getComment());
        score.setRecommended(request.getRecommended());

        ApplicantAnswerScore saved = scoreRepo.save(score);
        return toResponse(saved);
    }

    public List<ApplicantAnswerScoreResponse> getScoresForInterview(Long interviewId) {
        return scoreRepo.findByOnlineInterview(
                        applicantAnswerRepo.findById(interviewId)
                                .map(ApplicantAnswer::getOnlineInterview)
                                .orElseThrow(() -> new RuntimeException("Interview not found"))
                )
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public List<ApplicantAnswerScoreResponse> getScoresForInterviewDirect(OnlineInterview interview) {
        return scoreRepo.findByOnlineInterview(interview).stream().map(this::toResponse).toList();
    }

    private ApplicantAnswerScoreResponse toResponse(ApplicantAnswerScore score) {
        return ApplicantAnswerScoreResponse.builder()
                .id(score.getId())
                .applicantAnswerId(score.getApplicantAnswer().getId())
                .panelMemberName(score.getPanelMember().getFullName())
                .marksAwarded(score.getMarksAwarded())
                .maxMarks(score.getApplicantAnswer().getQuestionSetItem().getMarks())
                .comment(score.getComment())
                .recommended(score.getRecommended())
                .markedAt(score.getMarkedAt())
                .build();
    }
}