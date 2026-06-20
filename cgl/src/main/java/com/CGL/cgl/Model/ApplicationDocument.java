package com.CGL.cgl.Model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "application_documents")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ApplicationDocument {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @JsonIgnore
    @ManyToOne
    @JoinColumn(name="application_id")
    private Applications application;

    @Enumerated(EnumType.STRING)
    private DocumentType documentType;

    private String filePath;

    private LocalDateTime uploadDate;

    @PrePersist
    public void onCreate() {
        uploadDate = LocalDateTime.now();
    }
}