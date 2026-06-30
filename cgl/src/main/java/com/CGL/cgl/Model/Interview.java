package com.CGL.cgl.Model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import com.fasterxml.jackson.annotation.JsonIgnore;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;


@Entity
@Table(name = "interviews")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Interview {


    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;



    @OneToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "application_id", unique = true)
    private Applications application;

    private LocalDate interviewDate;


    private LocalTime interviewTime;


    private String venue;


    @Enumerated(EnumType.STRING)
    private InterviewStatus status;


    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by")
    @JsonIgnore
    private Users createdBy;


    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    private Integer durationMinutes;

    private LocalDateTime examStartedAt;

}