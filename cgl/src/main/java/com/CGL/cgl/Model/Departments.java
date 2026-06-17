package com.CGL.cgl.Model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Setter
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "Departments")
public class Departments {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "departmentName", nullable = false)
    private String departmentName;
    @Column(name = "description" , nullable = false)
    private String description;

    @OneToOne
    @JoinColumn(name = "department_head_id", nullable = false)
    private Users departmentHead;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdDate;

}
