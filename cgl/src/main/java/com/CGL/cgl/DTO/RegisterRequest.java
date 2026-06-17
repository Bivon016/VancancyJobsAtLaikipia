package com.CGL.cgl.DTO;


import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor

public class RegisterRequest {

    private String fName;
    private String lName;
    private String password;
    private String email;
    private String phoneNumber;

}
