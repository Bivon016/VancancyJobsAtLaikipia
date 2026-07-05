package com.CGL.cgl.DTO;

import com.CGL.cgl.Model.DifficultyLevel;
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
public class InterviewQuestionResponse {
    private long id;
    private String questionText;
    private QuestionType questionType;
    private Integer defaultMarks;
    private String expectedAnswer;   // null unless viewer is PANEL_MEMBER or SUPER_ADMIN
    private String markingGuide;     // null unless viewer is PANEL_MEMBER or SUPER_ADMIN
    private DifficultyLevel difficultyLevel;
    private Boolean required;
    private List<QuestionOptionResponse> options; // correct flag null unless viewer is PANEL_MEMBER or SUPER_ADMIN
    private String createdByName;
    private LocalDateTime createdAt;
}