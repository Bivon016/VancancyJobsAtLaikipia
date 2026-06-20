package com.CGL.cgl.Model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "shortlists")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Shortlist {


    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;


    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "application_id")
    private Applications application;


    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "shortlisted_by")
    private Users shortlistedBy;


    private LocalDateTime shortlistedDate;


    private String remarks;


    @PrePersist
    public void onCreate() {
        shortlistedDate = LocalDateTime.now();
    }

}