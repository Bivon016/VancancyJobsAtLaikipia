package com.CGL.cgl.DTO;

import com.CGL.cgl.Model.Role;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminUserDetailDTO {
    private Long id;
    private String fName;
    private String lName;
    private String email;
    private String phoneNumber;
    private Role role;
    private boolean emailVerified;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
