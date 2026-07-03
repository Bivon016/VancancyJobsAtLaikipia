package com.CGL.cgl.Model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "online_interview_panels")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OnlineInterviewPanel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "online_interview_id")
    private OnlineInterview onlineInterview;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "panel_member_id")
    private Users panelMember;
}
