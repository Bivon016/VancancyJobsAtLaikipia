package com.CGL.cgl.Model;

import jakarta.persistence.*;
import lombok.*;


@Entity
@Table(name = "vacancy_requirements")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class VacancyRequirement {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vacancy_id")
    private JobVacancy vacancy;

    @Enumerated(EnumType.STRING)
    private DocumentType documentType;
}
