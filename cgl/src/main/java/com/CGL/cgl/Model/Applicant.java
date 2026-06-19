package com.CGL.cgl.Model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Applicant {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    private Users user;

    private LocalDate birthDate;

    @Column(nullable = false, unique = true)
    private String nationalId;

    @Enumerated(EnumType.STRING)
    private Gender gender;

    private String county;

    private String educationalLevel;

    private Integer yearsOfExperience;
    private String cvPath;
    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;
}
