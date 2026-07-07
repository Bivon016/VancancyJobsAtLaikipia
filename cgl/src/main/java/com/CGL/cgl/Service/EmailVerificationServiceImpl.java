package com.CGL.cgl.Service;

import com.CGL.cgl.Model.EmailVerificationToken;
import com.CGL.cgl.Model.Users;
import com.CGL.cgl.Repo.EmailVerificationTokenRepo;
import com.CGL.cgl.Repo.UserRepo;
import java.time.LocalDateTime;
import java.util.Random;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class EmailVerificationServiceImpl implements EmailVerificationService {

    private final EmailVerificationTokenRepo tokenRepo;
    private final EmailService emailService;
    private final UserRepo userRepo;

    public EmailVerificationServiceImpl(
        EmailVerificationTokenRepo tokenRepo,
        EmailService emailService,
        UserRepo userRepo
    ) {
        this.tokenRepo = tokenRepo;
        this.emailService = emailService;
        this.userRepo = userRepo;
    }

    @Override
    @Transactional
    public EmailVerificationToken createVerificationToken(Users user) {

        EmailVerificationToken token = tokenRepo.findByUser(user)
                .orElse(new EmailVerificationToken());

        token.setUser(user);
        token.setCode(generateVerificationCode());
        token.setExpiryDate(LocalDateTime.now().plusMinutes(15));
        token.setUsed(false);
        token.setVerifiedAt(null);

        return tokenRepo.save(token);
    }

    @Override
    @Transactional
    public void sendVerificationEmail(Users user) {
        EmailVerificationToken token = createVerificationToken(user);

        String htmlBody = EmailTemplates.emailVerification(
            user.getFName(),
            token.getCode()
        );

        emailService.sendHtmlEmail(
            user.getEmail(),
            "Verify your Laikipia County Jobs account",
            htmlBody
        );
    }

    @Override
    @Transactional
    public void verifyCode(String email, String code) {
        Users user = userRepo
            .findByEmail(email)
            .orElseThrow(() -> new RuntimeException("User not found"));

        EmailVerificationToken token = tokenRepo
            .findByUserAndCode(user, code)
            .orElseThrow(() ->
                new RuntimeException("Invalid verification code")
            );

        if (token.isUsed()) {
            throw new RuntimeException(
                "Verification code has already been used"
            );
        }

        if (token.getExpiryDate().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Verification code has expired");
        }

        user.setEmailVerified(true);
        token.setUsed(true);
        token.setVerifiedAt(LocalDateTime.now());
    }

    @Override
    @Transactional
    public void resendVerificationCode(String email) {
        Users user = userRepo
            .findByEmail(email)
            .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.isEmailVerified()) {
            throw new RuntimeException("Email is already verified");
        }

        sendVerificationEmail(user);
    }

    private String generateVerificationCode() {
        int code = 100000 + new Random().nextInt(900000);
        return String.valueOf(code);
    }
}
