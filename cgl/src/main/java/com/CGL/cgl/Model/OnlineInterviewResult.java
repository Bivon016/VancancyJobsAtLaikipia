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
public class OnlineInterviewResult {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "online_interview_id")
    private OnlineInterview onlineInterview;

    private Double totalScore;
    private Double averageScore;

    private Boolean recommended;

    @Enumerated(EnumType.STRING)
    private Recommendation recommendation;

    @Lob
    private String panelRemarks;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "finalized_by")
    private Users finalizedBy;

    private LocalDateTime finalizedAt;
}