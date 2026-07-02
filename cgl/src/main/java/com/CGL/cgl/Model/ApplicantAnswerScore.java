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
@Table(uniqueConstraints = @UniqueConstraint(columnNames = {"applicant_answer_id", "panel_member_id"}))
public class ApplicantAnswerScore {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "applicant_answer_id")
    private ApplicantAnswer applicantAnswer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "panel_member_id")
    private Users panelMember;

    private Double marksAwarded;

    @Lob
    private String comment;

    private Boolean recommended;

    private LocalDateTime markedAt;

    @PrePersist
    @PreUpdate
    protected void onSave() {
        this.markedAt = LocalDateTime.now();
    }
}