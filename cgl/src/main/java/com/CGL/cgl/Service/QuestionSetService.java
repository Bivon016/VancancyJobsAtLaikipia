package com.CGL.cgl.Service;

import com.CGL.cgl.DTO.*;
import com.CGL.cgl.Model.*;
import com.CGL.cgl.Repo.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class QuestionSetService {

    private final QuestionSetRepo questionSetRepo;
    private final QuestionSetItemRepo questionSetItemRepo;
    private final InterviewQuestionRepo interviewQuestionRepo;
    private final JobVacancyRepo jobVacancyRepo;
    private final UserRepo userRepo;
    private final InterviewQuestionService interviewQuestionService;

    public QuestionSetService(QuestionSetRepo questionSetRepo, QuestionSetItemRepo questionSetItemRepo,
                              InterviewQuestionRepo interviewQuestionRepo, JobVacancyRepo jobVacancyRepo,
                              UserRepo userRepo, InterviewQuestionService interviewQuestionService) {
        this.questionSetRepo = questionSetRepo;
        this.questionSetItemRepo = questionSetItemRepo;
        this.interviewQuestionRepo = interviewQuestionRepo;
        this.jobVacancyRepo = jobVacancyRepo;
        this.userRepo = userRepo;
        this.interviewQuestionService = interviewQuestionService;
    }

    @Transactional
    public QuestionSetResponse createQuestionSet(CreateQuestionSetRequest request, String email) {
        Users user = requirePanelOrAdmin(email);

        if (request.getTitle() == null || request.getTitle().isBlank()) {
            throw new RuntimeException("Title is required");
        }

        JobVacancy vacancy = jobVacancyRepo.findById(request.getVacancyId())
                .orElseThrow(() -> new RuntimeException("Vacancy not found"));

        QuestionSet questionSet = QuestionSet.builder()
                .title(request.getTitle().trim())
                .description(request.getDescription())
                .vacancy(vacancy)
                .published(false)
                .createdBy(user)
                .build();

        QuestionSet saved = questionSetRepo.save(questionSet);
        return toResponse(saved, user.getRole());
    }

    @Transactional
    public QuestionSetResponse addQuestionToSet(Long setId, AddQuestionToSetRequest request, String email) {
        Users user = requirePanelOrAdmin(email);

        QuestionSet questionSet = questionSetRepo.findById(setId)
                .orElseThrow(() -> new RuntimeException("Question set not found"));

        if (Boolean.TRUE.equals(questionSet.getPublished())) {
            throw new RuntimeException("Cannot modify a published question set. Unpublish it first.");
        }

        InterviewQuestion question = interviewQuestionRepo.findById(request.getQuestionId())
                .orElseThrow(() -> new RuntimeException("Question not found"));

        if (questionSetItemRepo.findByQuestionSetAndQuestion(questionSet, question).isPresent()) {
            throw new RuntimeException("This question is already in the set");
        }

        int nextOrder = request.getOrderIndex() != null
                ? request.getOrderIndex()
                : questionSetItemRepo.countByQuestionSet(questionSet) + 1;

        QuestionSetItem item = QuestionSetItem.builder()
                .questionSet(questionSet)
                .question(question)
                .orderIndex(nextOrder)
                .marks(request.getMarks() != null ? request.getMarks() : question.getDefaultMarks())
                .required(request.getRequired() == null ? Boolean.TRUE : request.getRequired())
                .build();

        questionSetItemRepo.save(item);

        QuestionSet refreshed = questionSetRepo.findById(setId)
                .orElseThrow(() -> new RuntimeException("Question set not found"));
        return toResponse(refreshed, user.getRole());
    }

    @Transactional
    public QuestionSetResponse removeQuestionFromSet(Long setId, Long questionId, String email) {
        Users user = requirePanelOrAdmin(email);

        QuestionSet questionSet = questionSetRepo.findById(setId)
                .orElseThrow(() -> new RuntimeException("Question set not found"));

        if (Boolean.TRUE.equals(questionSet.getPublished())) {
            throw new RuntimeException("Cannot modify a published question set. Unpublish it first.");
        }

        InterviewQuestion question = interviewQuestionRepo.findById(questionId)
                .orElseThrow(() -> new RuntimeException("Question not found"));

        QuestionSetItem item = questionSetItemRepo.findByQuestionSetAndQuestion(questionSet, question)
                .orElseThrow(() -> new RuntimeException("This question is not in the set"));

        questionSetItemRepo.delete(item);

        QuestionSet refreshed = questionSetRepo.findById(setId)
                .orElseThrow(() -> new RuntimeException("Question set not found"));
        return toResponse(refreshed, user.getRole());
    }

    @Transactional
    public QuestionSetResponse publishQuestionSet(Long setId, String email) {
        Users user = requirePanelOrAdmin(email);

        QuestionSet questionSet = questionSetRepo.findById(setId)
                .orElseThrow(() -> new RuntimeException("Question set not found"));

        if (questionSetItemRepo.countByQuestionSet(questionSet) == 0) {
            throw new RuntimeException("Cannot publish an empty question set");
        }

        questionSet.setPublished(true);
        QuestionSet saved = questionSetRepo.save(questionSet);
        return toResponse(saved, user.getRole());
    }

    @Transactional
    public QuestionSetResponse unpublishQuestionSet(Long setId, String email) {
        Users user = requirePanelOrAdmin(email);

        QuestionSet questionSet = questionSetRepo.findById(setId)
                .orElseThrow(() -> new RuntimeException("Question set not found"));

        questionSet.setPublished(false);
        QuestionSet saved = questionSetRepo.save(questionSet);
        return toResponse(saved, user.getRole());
    }

    public QuestionSetResponse getQuestionSetById(Long setId, String email) {
        Users user = userRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        QuestionSet questionSet = questionSetRepo.findById(setId)
                .orElseThrow(() -> new RuntimeException("Question set not found"));

        if (user.getRole() == Role.HR_OFFICER && !Boolean.TRUE.equals(questionSet.getPublished())) {
            throw new RuntimeException("This question set is not yet published");
        }

        return toResponse(questionSet, user.getRole());
    }

    public List<QuestionSetResponse> getAllQuestionSets(String email) {
        Users user = userRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<QuestionSet> sets = user.getRole() == Role.HR_OFFICER
                ? questionSetRepo.findByPublished(true)
                : questionSetRepo.findAll();

        return sets.stream().map(s -> toResponse(s, user.getRole())).toList();
    }

    public List<QuestionSetResponse> getQuestionSetsByVacancy(Long vacancyId, String email) {
        Users user = userRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        JobVacancy vacancy = jobVacancyRepo.findById(vacancyId)
                .orElseThrow(() -> new RuntimeException("Vacancy not found"));

        List<QuestionSet> sets = user.getRole() == Role.HR_OFFICER
                ? questionSetRepo.findByVacancyAndPublished(vacancy, true)
                : questionSetRepo.findByVacancy(vacancy);

        return sets.stream().map(s -> toResponse(s, user.getRole())).toList();
    }

    // --- helpers ---

    private Users requirePanelOrAdmin(String email) {
        Users user = userRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getRole() != Role.PANEL_MEMBER && user.getRole() != Role.SUPER_ADMIN) {
            throw new RuntimeException("You are not allowed to perform this action!");
        }
        return user;
    }

    private QuestionSetResponse toResponse(QuestionSet set, Role viewerRole) {
        List<QuestionSetItemResponse> itemResponses = questionSetItemRepo
                .findByQuestionSetOrderByOrderIndexAsc(set)
                .stream()
                .map(item -> QuestionSetItemResponse.builder()
                        .itemId(item.getId())
                        .orderIndex(item.getOrderIndex())
                        .marks(item.getMarks())
                        .required(item.getRequired())
                        .question(interviewQuestionService.toResponse(item.getQuestion(), viewerRole))
                        .build())
                .toList();

        return QuestionSetResponse.builder()
                .id(set.getId())
                .title(set.getTitle())
                .description(set.getDescription())
                .vacancyId(set.getVacancy() != null ? set.getVacancy().getId() : null)
                .vacancyTitle(set.getVacancy() != null ? set.getVacancy().getTitle() : null)
                .published(set.getPublished())
                .createdByName(set.getCreatedBy() != null ? set.getCreatedBy().getFullName() : null)
                .createdAt(set.getCreatedAt())
                .updatedAt(set.getUpdatedAt())
                .items(itemResponses)
                .build();
    }
}