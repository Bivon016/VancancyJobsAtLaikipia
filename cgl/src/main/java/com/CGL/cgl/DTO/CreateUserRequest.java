package com.CGL.cgl.DTO;

import com.CGL.cgl.Model.Role;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

    @Getter
    @Setter
    @AllArgsConstructor
    @NoArgsConstructor

    public class CreateUserRequest {

        private String fName;
        private String lName;
        private String password;
        private String email;
        private String phoneNumber;
        private Role role;
    }
