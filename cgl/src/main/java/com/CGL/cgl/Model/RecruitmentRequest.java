package com.CGL.cgl.Model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "recruitment_requests")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RecruitmentRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "department_id")
    private Departments department;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "requested_by")
    private Users requestedBy;

    private String jobTitle;

    @Column(columnDefinition = "TEXT")
    private String jobDescription;

    @Column(columnDefinition = "TEXT")
    private String keyDuties;

    @Column(columnDefinition = "TEXT")
    private String academicQualifications;

    @Column(columnDefinition = "TEXT")
    private String professionalQualifications;

    @Column(columnDefinition = "TEXT")
    private String experience;

    @Column(columnDefinition = "TEXT")
    private String technicalSkills;

    @Column(columnDefinition = "TEXT")
    private String personalAttributes;

    @Column(columnDefinition = "TEXT")
    private String competencies;

    private Integer numberOfPositions;

    @Column(columnDefinition = "TEXT")
    private String reason;

    @Enumerated(EnumType.STRING)
    private Status status;

    @CreationTimestamp
    private LocalDateTime requestDate;
    private LocalDateTime approvedDate;

}
