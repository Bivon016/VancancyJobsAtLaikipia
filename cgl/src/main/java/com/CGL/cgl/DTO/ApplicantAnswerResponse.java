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
    private Boolean answeredCorrectly; // null unless viewer is a panel member and the question is option-based
    private LocalDateTime answeredAt;
    private LocalDateTime lastEditedAt;
    private PanelScoreSummaryResponse myScore;
}