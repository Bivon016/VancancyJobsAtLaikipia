package com.CGL.cgl.Model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InterviewQuestion {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "interview_id")
    private Interview interview;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vacancy_id")
    private JobVacancy vacancy;

    private String interview_question;

    @Enumerated(EnumType.STRING)
    private QuestionType questionType;

    @Column(length = 2000)
    private String optionsJson;

    private Boolean required;

    @Column(length = 250)
    private String correctAnswer;

    private LocalDateTime createdAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by")
    private Users createdBy;

    @Enumerated(EnumType.STRING)
    private QuestionStatus status;

    @Column(length = 2000)
    private String modelAnswer;

    @Column(length = 2000)
    private String markingRubric;

    private Integer maxScore;

    @PrePersist
    protected void onCreate() {
        if (this.createdAt == null) {
            this.createdAt = LocalDateTime.now();
        }
    }
}