package com.CGL.cgl.DTO;

import lombok.*;

import java.time.LocalDate;
import java.time.LocalTime;


@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class InterviewRequest {


    private Long applicationId;


    private LocalDate interviewDate;


    private LocalTime interviewTime;


    private String venue;


}