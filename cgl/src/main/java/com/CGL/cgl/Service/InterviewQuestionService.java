package com.CGL.cgl.Service;

import com.CGL.cgl.DTO.CreateInterviewQuestionRequest;
import com.CGL.cgl.Exception.ConflictException;
import com.CGL.cgl.Exception.ForbiddenException;
import com.CGL.cgl.Exception.ResourceNotFoundException;
import com.CGL.cgl.DTO.InterviewQuestionResponse;
import com.CGL.cgl.DTO.QuestionOptionRequest;
import com.CGL.cgl.DTO.QuestionOptionResponse;
import com.CGL.cgl.Model.InterviewQuestion;
import com.CGL.cgl.Model.InterviewQuestionOption;
import com.CGL.cgl.Model.QuestionType;
import com.CGL.cgl.Model.Role;
import com.CGL.cgl.Model.Users;
import com.CGL.cgl.Repo.InterviewQuestionRepo;
import com.CGL.cgl.Repo.QuestionSetItemRepo;
import com.CGL.cgl.Repo.UserRepo;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;

@Service
public class InterviewQuestionService {

    private static final Set<QuestionType> OPTION_BASED_TYPES =
            Set.of(QuestionType.MULTIPLE_CHOICE, QuestionType.CHECKBOX, QuestionType.TRUE_FALSE);

    private final InterviewQuestionRepo interviewQuestionRepo;
    private final UserRepo userRepo;
    private final QuestionSetItemRepo questionSetItemRepo;

    public InterviewQuestionService(InterviewQuestionRepo interviewQuestionRepo, UserRepo userRepo,
                                     QuestionSetItemRepo questionSetItemRepo) {
        this.interviewQuestionRepo = interviewQuestionRepo;
        this.userRepo = userRepo;
        this.questionSetItemRepo = questionSetItemRepo;
    }

    @Transactional
    public InterviewQuestionResponse createQuestion(CreateInterviewQuestionRequest request, String email) {
        Users user = requirePanelOrAdmin(email);
        validate(request);

        InterviewQuestion question = buildQuestion(request, user);
        InterviewQuestion saved = interviewQuestionRepo.save(question);
        return toResponse(saved, user.getRole());
    }

    @Transactional
    public List<InterviewQuestionResponse> createQuestions(List<CreateInterviewQuestionRequest> requests, String email) {
        Users user = requirePanelOrAdmin(email);

        if (requests == null || requests.isEmpty()) {
            throw new ConflictException("At least one question is required");
        }

        List<InterviewQuestion> questions = requests.stream().map(request -> {
            validate(request);
            return buildQuestion(request, user);
        }).toList();

        List<InterviewQuestion> savedQuestions = interviewQuestionRepo.saveAll(questions);
        return savedQuestions.stream().map(q -> toResponse(q, user.getRole())).toList();
    }

    @Transactional
    public InterviewQuestionResponse updateQuestion(Long id, CreateInterviewQuestionRequest request, String email) {
        Users user = requirePanelOrAdmin(email);
        validate(request);

        InterviewQuestion question = interviewQuestionRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Question not found"));

        question.setQuestionText(request.getQuestionText().trim());
        question.setQuestionType(request.getQuestionType());
        question.setDefaultMarks(request.getDefaultMarks());
        question.setExpectedAnswer(request.getExpectedAnswer());
        question.setMarkingGuide(request.getMarkingGuide());
        question.setDifficultyLevel(request.getDifficultyLevel());
        question.setRequired(request.getRequired() == null ? Boolean.TRUE : request.getRequired());

        // orphanRemoval=true on the collection means clearing + re-adding
        // replaces the option set cleanly instead of leaving stale rows behind.
        question.getOptions().clear();
        question.getOptions().addAll(buildOptions(request.getOptions(), question));

        InterviewQuestion saved = interviewQuestionRepo.save(question);
        return toResponse(saved, user.getRole());
    }

    @Transactional
    public void deleteQuestion(Long id, String email) {
        requirePanelOrAdmin(email);

        InterviewQuestion question = interviewQuestionRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Question not found"));

        if (questionSetItemRepo.existsByQuestion(question)) {
            throw new ConflictException("Cannot delete a question that is already used in a question set. Remove it from all question sets first.");
        }

        interviewQuestionRepo.deleteById(id);
    }

    @Transactional(readOnly = true)
    public List<InterviewQuestionResponse> getAllQuestions(String email) {
        Users user = userRepo.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        return interviewQuestionRepo.findAll().stream()
                .map(q -> toResponse(q, user.getRole()))
                .toList();
    }

    @Transactional(readOnly = true)
    public InterviewQuestionResponse getQuestionById(Long id, String email) {
        Users user = userRepo.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        InterviewQuestion question = interviewQuestionRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Question not found"));

        return toResponse(question, user.getRole());
    }

    // --- helpers ---

    private Users requirePanelOrAdmin(String email) {
        Users user = userRepo.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (user.getRole() != Role.PANEL_MEMBER && user.getRole() != Role.SUPER_ADMIN) {
            throw new ForbiddenException("You are not allowed to perform this action!");
        }
        return user;
    }

    private InterviewQuestion buildQuestion(CreateInterviewQuestionRequest request, Users user) {
        InterviewQuestion question = InterviewQuestion.builder()
                .questionText(request.getQuestionText().trim())
                .questionType(request.getQuestionType())
                .defaultMarks(request.getDefaultMarks())
                .expectedAnswer(request.getExpectedAnswer())
                .markingGuide(request.getMarkingGuide())
                .difficultyLevel(request.getDifficultyLevel())
                .required(request.getRequired() == null ? Boolean.TRUE : request.getRequired())
                .createdBy(user)
                .build();

        question.getOptions().addAll(buildOptions(request.getOptions(), question));
        return question;
    }

    private List<InterviewQuestionOption> buildOptions(List<QuestionOptionRequest> optionRequests, InterviewQuestion question) {
        if (optionRequests == null) {
            return List.of();
        }
        List<InterviewQuestionOption> options = new ArrayList<>();
        int index = 0;
        for (QuestionOptionRequest optionRequest : optionRequests) {
            options.add(InterviewQuestionOption.builder()
                    .question(question)
                    .optionText(optionRequest.getOptionText().trim())
                    .correct(Boolean.TRUE.equals(optionRequest.getCorrect()))
                    .orderIndex(index++)
                    .build());
        }
        return options;
    }

    private void validate(CreateInterviewQuestionRequest request) {
        if (request.getQuestionText() == null || request.getQuestionText().isBlank()) {
            throw new ConflictException("Question text is required");
        }
        if (request.getQuestionType() == null) {
            throw new ConflictException("Question type is required");
        }
        if (request.getDifficultyLevel() == null) {
            throw new ConflictException("Difficulty level is required");
        }
        if (request.getDefaultMarks() == null || request.getDefaultMarks() <= 0) {
            throw new ConflictException("Default marks must be greater than 0");
        }

        boolean needsOptions = OPTION_BASED_TYPES.contains(request.getQuestionType());
        List<QuestionOptionRequest> options = request.getOptions();

        if (needsOptions) {
            if (options == null || options.size() < 2) {
                throw new ConflictException(request.getQuestionType() + " questions require at least 2 options");
            }
            for (QuestionOptionRequest option : options) {
                if (option.getOptionText() == null || option.getOptionText().isBlank()) {
                    throw new ConflictException("Every option must have text");
                }
            }
            boolean hasCorrectOption = options.stream().anyMatch(o -> Boolean.TRUE.equals(o.getCorrect()));
            if (!hasCorrectOption) {
                throw new ConflictException("At least one option must be marked correct");
            }
            if (request.getQuestionType() == QuestionType.TRUE_FALSE) {
                if (options.size() != 2) {
                    throw new ConflictException("TRUE_FALSE questions must have exactly 2 options");
                }
                long correctCount = options.stream().filter(o -> Boolean.TRUE.equals(o.getCorrect())).count();
                if (correctCount != 1) {
                    throw new ConflictException("TRUE_FALSE questions must have exactly 1 correct option");
                }
            }
            if (request.getQuestionType() == QuestionType.MULTIPLE_CHOICE) {
                long correctCount = options.stream().filter(o -> Boolean.TRUE.equals(o.getCorrect())).count();
                if (correctCount != 1) {
                    throw new ConflictException("MULTIPLE_CHOICE questions must have exactly 1 correct option");
                }
            }
        } else if (options != null && !options.isEmpty()) {
            throw new ConflictException(request.getQuestionType() + " questions do not use options");
        }
    }

    public InterviewQuestionResponse toResponse(InterviewQuestion q, Role viewerRole) {
        boolean canSeeAnswerKey = viewerRole == Role.PANEL_MEMBER || viewerRole == Role.SUPER_ADMIN;

        List<QuestionOptionResponse> optionResponses = q.getOptions().stream()
                .sorted((a, b) -> {
                    Integer ai = a.getOrderIndex() != null ? a.getOrderIndex() : 0;
                    Integer bi = b.getOrderIndex() != null ? b.getOrderIndex() : 0;
                    return ai.compareTo(bi);
                })
                .map(o -> QuestionOptionResponse.builder()
                        .id(o.getId())
                        .optionText(o.getOptionText())
                        .correct(canSeeAnswerKey ? o.getCorrect() : null)
                        .orderIndex(o.getOrderIndex())
                        .build())
                .toList();

        return InterviewQuestionResponse.builder()
                .id(q.getId())
                .questionText(q.getQuestionText())
                .questionType(q.getQuestionType())
                .defaultMarks(q.getDefaultMarks())
                .expectedAnswer(canSeeAnswerKey ? q.getExpectedAnswer() : null)
                .markingGuide(canSeeAnswerKey ? q.getMarkingGuide() : null)
                .difficultyLevel(q.getDifficultyLevel())
                .required(q.getRequired())
                .options(optionResponses)
                .createdByName(q.getCreatedBy() != null ? q.getCreatedBy().getFullName() : null)
                .createdAt(q.getCreatedAt())
                .build();
    }
}
