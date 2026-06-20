package com.CGL.cgl.Model;

import jakarta.persistence.*;
import lombok.*;


@Entity
@Table(name = "interview_panels")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InterviewPanel {


    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;


    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "interview_id")
    private Interview interview;


    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "panel_member_id")
    private Users panelMember;


}