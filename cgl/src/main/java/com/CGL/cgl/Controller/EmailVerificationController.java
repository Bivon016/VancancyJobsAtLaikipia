package com.CGL.cgl.Controller;

import com.CGL.cgl.DTO.ResendVerificationCodeRequest;
import com.CGL.cgl.DTO.VerifyEmailCodeRequest;
import com.CGL.cgl.Service.EmailVerificationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/auth")
public class EmailVerificationController {

    private final EmailVerificationService emailVerificationService;

    public EmailVerificationController(
        EmailVerificationService emailVerificationService
    ) {
        this.emailVerificationService = emailVerificationService;
    }

    @PostMapping("/verify-email")
    public ResponseEntity<String> verifyEmail(
        @RequestBody VerifyEmailCodeRequest request
    ) {
        emailVerificationService.verifyCode(
            request.getEmail(),
            request.getCode()
        );
        return ResponseEntity.ok("Email verified successfully");
    }

    @PostMapping("/resend-verification-code")
    public ResponseEntity<String> resendVerificationCode(
        @RequestBody ResendVerificationCodeRequest request
    ) {
        emailVerificationService.resendVerificationCode(request.getEmail());
        return ResponseEntity.ok("Verification code sent successfully");
    }
}
