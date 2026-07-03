package com.CGL.cgl.Service;

import com.CGL.cgl.DTO.CreateInterviewQuestionRequest;
import com.CGL.cgl.DTO.InterviewQuestionResponse;
import com.CGL.cgl.Model.InterviewQuestion;
import com.CGL.cgl.Model.Role;
import com.CGL.cgl.Model.Users;
import com.CGL.cgl.Repo.InterviewQuestionRepo;
import com.CGL.cgl.Repo.UserRepo;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class InterviewQuestionService {

    private final InterviewQuestionRepo interviewQuestionRepo;
    private final UserRepo userRepo;

    public InterviewQuestionService(InterviewQuestionRepo interviewQuestionRepo, UserRepo userRepo) {
        this.interviewQuestionRepo = interviewQuestionRepo;
        this.userRepo = userRepo;
    }

    @Transactional
    public InterviewQuestionResponse createQuestion(CreateInterviewQuestionRequest request, String email) {
        Users user = userRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getRole() != Role.PANEL_MEMBER && user.getRole() != Role.SUPER_ADMIN) {
            throw new RuntimeException("You are not allowed to perform this action!");
        }

        validate(request);

        InterviewQuestion question = InterviewQuestion.builder()
                .title(request.getTitle().trim())
                .questionText(request.getQuestionText().trim())
                .questionType(request.getQuestionType())
                .defaultMarks(request.getDefaultMarks())
                .expectedAnswer(request.getExpectedAnswer())
                .markingGuide(request.getMarkingGuide())
                .difficultyLevel(request.getDifficultyLevel())
                .required(request.getRequired() == null ? Boolean.TRUE : request.getRequired())
                .createdBy(user)
                .build();

        InterviewQuestion saved = interviewQuestionRepo.save(question);
        return toResponse(saved, user.getRole());
    }

    @Transactional
    public List<InterviewQuestionResponse> createQuestions(List<CreateInterviewQuestionRequest> requests, String email) {
        Users user = userRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getRole() != Role.PANEL_MEMBER && user.getRole() != Role.SUPER_ADMIN) {
            throw new RuntimeException("You are not allowed to perform this action!");
        }

        if (requests == null || requests.isEmpty()) {
            throw new RuntimeException("At least one question is required");
        }

        List<InterviewQuestion> questions = requests.stream().map(request -> {
            validate(request);
            return InterviewQuestion.builder()
                    .title(request.getTitle().trim())
                    .questionText(request.getQuestionText().trim())
                    .questionType(request.getQuestionType())
                    .defaultMarks(request.getDefaultMarks())
                    .expectedAnswer(request.getExpectedAnswer())
                    .markingGuide(request.getMarkingGuide())
                    .difficultyLevel(request.getDifficultyLevel())
                    .required(request.getRequired() == null ? Boolean.TRUE : request.getRequired())
                    .createdBy(user)
                    .build();
        }).toList();

        List<InterviewQuestion> savedQuestions = interviewQuestionRepo.saveAll(questions);
        return savedQuestions.stream().map(q -> toResponse(q, user.getRole())).toList();
    }

    @Transactional(readOnly = true)
    public List<InterviewQuestionResponse> getAllQuestions(String email) {
        Users user = userRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return interviewQuestionRepo.findAll().stream()
                .map(q -> toResponse(q, user.getRole()))
                .toList();
    }

    @Transactional(readOnly = true)
    public InterviewQuestionResponse getQuestionById(Long id, String email) {
        Users user = userRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        InterviewQuestion question = interviewQuestionRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Question not found"));

        return toResponse(question, user.getRole());
    }

    private void validate(CreateInterviewQuestionRequest request) {
        if (request.getTitle() == null || request.getTitle().isBlank()) {
            throw new RuntimeException("Title is required");
        }
        if (request.getQuestionText() == null || request.getQuestionText().isBlank()) {
            throw new RuntimeException("Question text is required");
        }
        if (request.getQuestionType() == null) {
            throw new RuntimeException("Question type is required");
        }
        if (request.getDifficultyLevel() == null) {
            throw new RuntimeException("Difficulty level is required");
        }
        if (request.getDefaultMarks() == null || request.getDefaultMarks() <= 0) {
            throw new RuntimeException("Default marks must be greater than 0");
        }
    }

    public InterviewQuestionResponse toResponse(InterviewQuestion q, Role viewerRole) {
        boolean canSeeAnswerKey = viewerRole == Role.PANEL_MEMBER || viewerRole == Role.SUPER_ADMIN;

        return InterviewQuestionResponse.builder()
                .id(q.getId())
                .title(q.getTitle())
                .questionText(q.getQuestionText())
                .questionType(q.getQuestionType())
                .defaultMarks(q.getDefaultMarks())
                .expectedAnswer(canSeeAnswerKey ? q.getExpectedAnswer() : null)
                .markingGuide(canSeeAnswerKey ? q.getMarkingGuide() : null)
                .difficultyLevel(q.getDifficultyLevel())
                .required(q.getRequired())
                .createdByName(q.getCreatedBy() != null ? q.getCreatedBy().getFullName(): null)
                .createdAt(q.getCreatedAt())
                .build();
    }
}