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
public class Applications {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    private Applicant applicant;

    @ManyToOne(fetch = FetchType.EAGER)
    private JobVacancy vacancy;

    private LocalDateTime applicationDate;

    @Enumerated(EnumType.STRING)
    private ApplicationState applicationStatus;

    @Column(nullable = true)
    private String remarks;

}
