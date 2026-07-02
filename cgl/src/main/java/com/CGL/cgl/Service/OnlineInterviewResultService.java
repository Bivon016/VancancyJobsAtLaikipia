package com.CGL.cgl.Service;

import com.CGL.cgl.DTO.FinalizeResultRequest;
import com.CGL.cgl.DTO.OnlineInterviewResultResponse;
import com.CGL.cgl.Model.*;
import com.CGL.cgl.Repo.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class OnlineInterviewResultService {

    private final OnlineInterviewResultRepo resultRepo;
    private final OnlineInterviewRepo onlineInterviewRepo;
    private final ApplicantAnswerRepo applicantAnswerRepo;
    private final ApplicantAnswerScoreRepo scoreRepo;
    private final UserRepo userRepo;
    private final JobVacancyRepo jobVacancyRepo;


    public OnlineInterviewResultService(OnlineInterviewResultRepo resultRepo, OnlineInterviewRepo onlineInterviewRepo,
                                        ApplicantAnswerRepo applicantAnswerRepo, ApplicantAnswerScoreRepo scoreRepo,
                                        UserRepo userRepo,JobVacancyRepo jobVacancyRepo) {
        this.resultRepo = resultRepo;
        this.onlineInterviewRepo = onlineInterviewRepo;
        this.applicantAnswerRepo = applicantAnswerRepo;
        this.scoreRepo = scoreRepo;
        this.userRepo = userRepo;
        this.jobVacancyRepo = jobVacancyRepo;
    }

    @Transactional
    public OnlineInterviewResultResponse finalizeResult(Long interviewId, FinalizeResultRequest request, String email) {
        Users user = userRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getRole() != Role.PANEL_MEMBER && user.getRole() != Role.SUPER_ADMIN) {
            throw new RuntimeException("You are not allowed to perform this action!");
        }

        OnlineInterview interview = onlineInterviewRepo.findById(interviewId)
                .orElseThrow(() -> new RuntimeException("Interview not found"));

        if (interview.getStatus() != OnlineInterviewStatus.SUBMITTED
                && interview.getStatus() != OnlineInterviewStatus.EVALUATED) {
            throw new RuntimeException("Interview must be submitted before it can be finalized");
        }

        if (request.getRecommendation() == null) {
            throw new RuntimeException("Recommendation is required");
        }

        List<ApplicantAnswer> answers = applicantAnswerRepo.findByOnlineInterview(interview);
        if (answers.isEmpty()) {
            throw new RuntimeException("No answers exist for this interview");
        }

        Map<Long, List<ApplicantAnswerScore>> scoresByAnswer = answers.stream()
                .collect(Collectors.toMap(
                        ApplicantAnswer::getId,
                        a -> scoreRepo.findByApplicantAnswer(a)
                ));

        boolean anyUnscored = scoresByAnswer.values().stream().anyMatch(List::isEmpty);
        if (anyUnscored) {
            throw new RuntimeException("All answers must be scored by at least one panel member before finalizing");
        }

        double totalScore = 0.0;
        int totalMaxMarks = 0;

        for (ApplicantAnswer answer : answers) {
            List<ApplicantAnswerScore> scores = scoresByAnswer.get(answer.getId());
            double averageForQuestion = scores.stream()
                    .mapToDouble(ApplicantAnswerScore::getMarksAwarded)
                    .average()
                    .orElse(0.0);
            totalScore += averageForQuestion;

            Integer maxMarks = answer.getQuestionSetItem().getMarks();
            totalMaxMarks += (maxMarks != null ? maxMarks : 0);
        }

        double averageScore = totalMaxMarks > 0 ? (totalScore / totalMaxMarks) * 100.0 : 0.0;

        OnlineInterviewResult result = resultRepo.findByOnlineInterview(interview)
                .orElse(OnlineInterviewResult.builder().onlineInterview(interview).build());

        result.setTotalScore(totalScore);
        result.setAverageScore(averageScore);
        result.setRecommendation(request.getRecommendation());
        result.setRecommended(request.getRecommendation() == Recommendation.SHORTLIST);
        result.setPanelRemarks(request.getPanelRemarks());
        result.setFinalizedBy(user);
        result.setFinalizedAt(LocalDateTime.now());

        OnlineInterviewResult saved = resultRepo.save(result);

        interview.setStatus(OnlineInterviewStatus.EVALUATED);
        onlineInterviewRepo.save(interview);

        return toResponse(saved);
    }

    public OnlineInterviewResultResponse getResult(Long interviewId) {
        OnlineInterview interview = onlineInterviewRepo.findById(interviewId)
                .orElseThrow(() -> new RuntimeException("Interview not found"));

        OnlineInterviewResult result = resultRepo.findByOnlineInterview(interview)
                .orElseThrow(() -> new RuntimeException("Result not yet finalized for this interview"));

        return toResponse(result);
    }
    public List<OnlineInterviewResultResponse> getResultsForVacancy(Long vacancyId, Recommendation recommendationFilter, String email) {
        requireHrOrAdminOrPanel(email);

        JobVacancy vacancy = jobVacancyRepo.findById(vacancyId)
                .orElseThrow(() -> new RuntimeException("Vacancy not found"));

        List<OnlineInterviewResult> results = recommendationFilter != null
                ? resultRepo.findByVacancyAndRecommendation(vacancy, recommendationFilter)
                : resultRepo.findByVacancy(vacancy);

        return results.stream().map(this::toResponse).toList();
    }

    public List<OnlineInterviewResultResponse> getAllResults(String email) {
        requireHrOrAdminOrPanel(email);
        return resultRepo.findAllOrderByFinalizedAtDesc().stream().map(this::toResponse).toList();
    }

    private Users requireHrOrAdminOrPanel(String email) {
        Users user = userRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getRole() != Role.HR_OFFICER && user.getRole() != Role.SUPER_ADMIN && user.getRole() != Role.PANEL_MEMBER) {
            throw new RuntimeException("You are not allowed to perform this action!");
        }
        return user;
    }
    private OnlineInterviewResultResponse toResponse(OnlineInterviewResult result) {
        Applications application = result.getOnlineInterview().getApplication();
        Applicant applicant = application.getApplicant();

        return OnlineInterviewResultResponse.builder()
                .id(result.getId())
                .onlineInterviewId(result.getOnlineInterview().getId())
                .applicationId(application.getId())
                .applicantName(applicant != null && applicant.getUser() != null ? applicant.getUser().getFullName() : null)
                .vacancyTitle(application.getVacancy() != null ? application.getVacancy().getTitle() : null)
                .totalScore(result.getTotalScore())
                .averageScore(result.getAverageScore())
                .recommended(result.getRecommended())
                .recommendation(result.getRecommendation())
                .panelRemarks(result.getPanelRemarks())
                .finalizedByName(result.getFinalizedBy() != null ? result.getFinalizedBy().getFullName() : null)
                .finalizedAt(result.getFinalizedAt())
                .build();
    }
}