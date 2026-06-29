package com.CGL.cgl.DTO;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AdminUpdateUserRequest {
    private String fName;
    private String lName;
    private String email;
    private String password;
}