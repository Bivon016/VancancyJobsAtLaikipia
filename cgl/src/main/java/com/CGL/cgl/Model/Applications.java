package com.CGL.cgl.Model;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

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

    @Column(length = 4000)
    private String suitabilityStatement;

    private Boolean declareInformationTrue;

    private Boolean declareAvailabilityForVerification;

    private Boolean declareNoConflictOfInterest;

    private Boolean declareNoCriminalConviction;

    private Boolean consentToDataProcessing;

    private Boolean documentsReadyConfirmed;

    @Builder.Default
    @OneToMany(
        mappedBy = "application",
        cascade = CascadeType.ALL,
        orphanRemoval = true,
        fetch = FetchType.EAGER
    )
    private List<ApplicationReferee> referees = new ArrayList<>();
}
