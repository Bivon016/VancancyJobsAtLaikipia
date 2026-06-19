package com.CGL.cgl.DTO;

import com.CGL.cgl.Model.ApplicationState;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class StatusUpdateRequestDTO {
    private ApplicationState status;
    private String remarks;
}
