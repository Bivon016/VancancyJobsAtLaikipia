package com.CGL.cgl.Service;

import com.CGL.cgl.Model.EmailVerificationToken;
import com.CGL.cgl.Model.Users;

public interface EmailVerificationService {
    EmailVerificationToken createVerificationToken(Users user);
    void sendVerificationEmail(Users user);
    void verifyCode(String email, String code);
    void resendVerificationCode(String email);
}
