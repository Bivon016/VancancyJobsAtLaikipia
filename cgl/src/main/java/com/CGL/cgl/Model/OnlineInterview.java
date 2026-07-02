package com.CGL.cgl.Model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OnlineInterview {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @OneToOne
    @JoinColumn(name = "application_id")
    private Applications application;

    private LocalDateTime opensAt;
    private LocalDateTime closesAt;

    private Integer durationMinutes;

    @Enumerated(EnumType.STRING)
    private OnlineInterviewStatus status;
    private String interviewToken;

    private LocalDateTime startedAt;
    private LocalDateTime submittedAt;
    private Boolean submitted;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by")
    private Users createdBy;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "question_set_id")
    private QuestionSet questionSet;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    }

