package com.CGL.cgl.Model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;


@Entity
@Table(name = "notifications")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Notification {


    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;


    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private Users user;


    private String title;


    @Column(length = 1000)
    private String message;


    private Boolean isRead = false;


    private LocalDateTime createdAt;



    @PrePersist
    public void onCreate(){

        createdAt = LocalDateTime.now();

        if(isRead == null){
            isRead = false;
        }

    }

}