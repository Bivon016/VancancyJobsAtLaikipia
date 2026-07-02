package com.CGL.cgl.DTO;

import com.CGL.cgl.Model.Recommendation;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class FinalizeResultRequest {
    private Recommendation recommendation;
    private String panelRemarks;
}