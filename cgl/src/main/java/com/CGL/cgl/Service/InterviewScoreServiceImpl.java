package com.CGL.cgl.Service;

import com.CGL.cgl.DTO.InterviewScoreRequest;
import com.CGL.cgl.Model.*;
import com.CGL.cgl.Repo.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class InterviewScoreServiceImpl
        implements InterviewScoreService {

    private final InterviewRepo interviewRepo;
    private final InterviewScoreRepo interviewScoreRepo;
    private final InterviewPanelRepo interviewPanelRepo;
    private final UserRepo userRepo;

    public InterviewScoreServiceImpl(
            InterviewRepo interviewRepo,
            InterviewScoreRepo interviewScoreRepo,
            InterviewPanelRepo interviewPanelRepo,
            UserRepo userRepo
    ) {
        this.interviewRepo = interviewRepo;
        this.interviewScoreRepo = interviewScoreRepo;
        this.interviewPanelRepo = interviewPanelRepo;
        this.userRepo = userRepo;
    }

    @Override
    @Transactional
    public InterviewScore submitScore(
            InterviewScoreRequest request,
            String email
    ) {

        Users panelMember =
                userRepo.findByEmail(email)
                        .orElseThrow(() ->
                                new RuntimeException("User not found")
                        );

        if (panelMember.getRole() != Role.PANEL_MEMBER) {
            throw new RuntimeException(
                    "Only panel members can score interviews"
            );

        }

        Interview interview =
                interviewRepo.findById(request.getInterviewId())
                        .orElseThrow(() ->
                                new RuntimeException("Interview not found")
                        );

        boolean assigned =
                interviewPanelRepo.existsByInterviewAndPanelMember(
                        interview,
                        panelMember
                );

        if (!assigned) {
            throw new RuntimeException(
                    "You are not assigned to this interview"
            );
        }
        if (interview.getStatus()
                != InterviewStatus.COMPLETED) {

            throw new RuntimeException(
                    "Interview must be completed before scoring"
            );
        }

        if (interviewScoreRepo
                .findByInterviewAndPanelMember(
                        interview,
                        panelMember
                )
                .isPresent()) {

            throw new RuntimeException(
                    "You have already submitted a score"
            );
        }
        // Validate scores
        if (request.getTechnicalScore() < 0 ||
                request.getTechnicalScore() > 100 ||

                request.getCommunicationScore() < 0 ||
                request.getCommunicationScore() > 100 ||

                request.getExperienceScore() < 0 ||
                request.getExperienceScore() > 100) {


            throw new RuntimeException(
                    "Scores must be between 0 and 100"
            );
        }


        Double totalScore =
                request.getTechnicalScore()
                        + request.getCommunicationScore()
                        + request.getExperienceScore();

        InterviewScore score =
                InterviewScore.builder()
                        .interview(interview)
                        .panelMember(panelMember)
                        .technicalScore(
                                request.getTechnicalScore()
                        )
                        .communicationScore(
                                request.getCommunicationScore()
                        )
                        .experienceScore(
                                request.getExperienceScore()
                        )
                        .totalScore(totalScore)
                        .remarks(request.getRemarks())
                        .build();

        return interviewScoreRepo.save(score);
    }

    @Override
    public List<InterviewScore> getInterviewScores(
            Long interviewId
    ) {

        Interview interview =
                interviewRepo.findById(interviewId)
                        .orElseThrow(() ->
                                new RuntimeException("Interview not found")
                        );

        return interviewScoreRepo.findByInterview(
                interview
        );
    }

    @Override
    public Double getAverageScore(
            Long interviewId
    ) {

        Interview interview =
                interviewRepo.findById(interviewId)
                        .orElseThrow(() ->
                                new RuntimeException("Interview not found")
                        );

        List<InterviewScore> scores =
                interviewScoreRepo.findByInterview(
                        interview
                );

        if (scores.isEmpty()) {
            return 0.0;
        }

        double total =
                scores.stream()
                        .mapToDouble(
                                InterviewScore::getTotalScore
                        )
                        .sum();

        return total / scores.size();
    }
}