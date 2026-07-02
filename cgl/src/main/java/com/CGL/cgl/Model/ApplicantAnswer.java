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
public class ApplicantAnswer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "online_interview_id")
    private OnlineInterview onlineInterview;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "question_set_item_id")
    private QuestionSetItem questionSetItem;

    @Lob
    private String answerText;

    private LocalDateTime answeredAt;
    private LocalDateTime lastEditedAt;

    @PrePersist
    protected void onCreate() {
        this.answeredAt = LocalDateTime.now();
        this.lastEditedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.lastEditedAt = LocalDateTime.now();
    }
}