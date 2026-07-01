package com.CGL.cgl.DTO;

import com.CGL.cgl.Model.Recommendation;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class RecommendationRequest {
    private Recommendation recommendation;
}
