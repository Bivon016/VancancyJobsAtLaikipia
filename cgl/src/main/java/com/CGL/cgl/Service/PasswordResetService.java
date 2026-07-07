package com.CGL.cgl.Service;

public interface PasswordResetService {
    void requestReset(String email);
    void resetPassword(String token, String newPassword);
}
