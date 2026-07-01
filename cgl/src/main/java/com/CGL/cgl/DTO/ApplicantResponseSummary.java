package com.CGL.cgl.DTO;

import com.CGL.cgl.Model.Recommendation;
import java.time.LocalDateTime;
import java.util.List;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class ApplicantResponseSummary {
    private Long responseId;
    private String applicantName;
    private String applicantEmail;
    private LocalDateTime submittedAt;
    private Recommendation recommendation;
    private List<AnswerSummary> answers;

    @Getter
    @Setter
    @Builder
    public static class AnswerSummary {
        private String questionText;
        private String answerText;
    }
}
