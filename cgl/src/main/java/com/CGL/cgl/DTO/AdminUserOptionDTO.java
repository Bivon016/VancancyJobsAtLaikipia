package com.CGL.cgl.DTO;

import com.CGL.cgl.Model.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminUserOptionDTO {

    private Long id;
    private String fName;
    private String lName;
    private String email;
    private String phoneNumber;
    private Role role;
}
