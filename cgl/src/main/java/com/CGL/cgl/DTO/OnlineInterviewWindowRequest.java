package com.CGL.cgl.DTO;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class OnlineInterviewWindowRequest {
    private Long questionSetId;
    private LocalDateTime opensAt;
    private LocalDateTime closesAt;
    private Integer durationMinutes;
}