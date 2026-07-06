package com.CGL.cgl.DTO;

import com.CGL.cgl.Model.QuestionType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ApplicantAnswerResponse {
    private Long id;
    private Long questionSetItemId;
    private String questionText;
    private QuestionType questionType;
    private Integer maxMarks;
    private String answerText; // raw stored value: free text, or option id(s) for option-based questions
    private List<String> selectedOptionTexts; // human-readable resolution of answerText for option-based questions
    private List<String> selectedOptionIds; // raw selected option id(s), so the panel UI can highlight them the same way the applicant UI did
    private List<QuestionOptionResponse> options; // full option list (correct flag only populated for panel viewers), so panel review renders identically to the applicant's question screen
    private Boolean answeredCorrectly; // null unless viewer is a panel member and the question is option-based
    private LocalDateTime answeredAt;
    private LocalDateTime lastEditedAt;
    private PanelScoreSummaryResponse myScore;
}