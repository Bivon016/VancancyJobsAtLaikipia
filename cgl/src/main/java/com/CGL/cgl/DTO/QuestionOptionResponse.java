package com.CGL.cgl.DTO;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class QuestionOptionResponse {
    private Long id;
    private String optionText;
    private Boolean correct; // null unless viewer is PANEL_MEMBER or SUPER_ADMIN
    private Integer orderIndex;
}
