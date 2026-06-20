package com.CGL.cgl.Model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "interview_scores", uniqueConstraints = {
                @UniqueConstraint(columnNames = {"interview_id", "panel_member_id"})})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InterviewScore {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "interview_id")
    private Interview interview;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "panel_member_id")
    private Users panelMember;

    private Double technicalScore;

    private Double communicationScore;

    private Double experienceScore;

    private Double totalScore;

    @Column(length = 1000)
    private String remarks;

    private LocalDateTime scoredAt;

    @PrePersist
    public void onCreate() {
        scoredAt = LocalDateTime.now();
    }
}