package com.CGL.cgl.Model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;


@Entity
@Table(name = "final_selections")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FinalSelection {


    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;


    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(
            name = "application_id",
            unique = true
    )
    private Applications application;


    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "approved_by")
    private Users approvedBy;


    private LocalDateTime approvalDate;

    private String remarks;
    @Enumerated(EnumType.STRING)
    private AppointmentStatus appointmentStatus;


    @PrePersist
    public void onCreate(){

        approvalDate = LocalDateTime.now();

    }

}