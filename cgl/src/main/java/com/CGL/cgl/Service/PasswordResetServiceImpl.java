package com.CGL.cgl.Service;

import com.CGL.cgl.Exception.ConflictException;
import com.CGL.cgl.Exception.ResourceNotFoundException;
import com.CGL.cgl.Model.PasswordResetToken;
import com.CGL.cgl.Model.Users;
import com.CGL.cgl.Repo.PasswordResetTokenRepo;
import com.CGL.cgl.Repo.UserRepo;
import java.time.LocalDateTime;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class PasswordResetServiceImpl implements PasswordResetService {

    private final PasswordResetTokenRepo tokenRepo;
    private final UserRepo userRepo;
    private final EmailService emailService;
    private final BCryptPasswordEncoder passwordEncoder;

    @Value("${app.frontend-base-url:http://localhost:5173}")
    private String frontendBaseUrl;

    public PasswordResetServiceImpl(
        PasswordResetTokenRepo tokenRepo,
        UserRepo userRepo,
        EmailService emailService,
        BCryptPasswordEncoder passwordEncoder
    ) {
        this.tokenRepo = tokenRepo;
        this.userRepo = userRepo;
        this.emailService = emailService;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void requestReset(String email) {
        Users user = userRepo.findByEmail(email).orElse(null);

        // Deliberately do nothing else visible if the email isn't found —
        // the API response is identical either way so we don't reveal
        // which emails have accounts.
        if (user == null) {
            return;
        }

        tokenRepo.findByUser(user).ifPresent(tokenRepo::delete);

        String rawToken = generateToken();

        PasswordResetToken resetToken = PasswordResetToken.builder()
            .token(rawToken)
            .user(user)
            .expiryDate(LocalDateTime.now().plusMinutes(30))
            .used(false)
            .build();

        tokenRepo.save(resetToken);

        String resetLink = frontendBaseUrl + "/reset-password?token=" + rawToken;

        String htmlBody = EmailTemplates.passwordReset(
            user.getFName(),
            resetLink
        );

        emailService.sendHtmlEmail(
            user.getEmail(),
            "Reset your Laikipia County Jobs password",
            htmlBody
        );
    }

    @Override
    @Transactional
    public void resetPassword(String token, String newPassword) {
        PasswordResetToken resetToken = tokenRepo
            .findByToken(token)
            .orElseThrow(() ->
                new ResourceNotFoundException("Invalid or expired reset link")
            );

        if (resetToken.isUsed()) {
            throw new ConflictException(
                "This reset link has already been used"
            );
        }

        if (resetToken.getExpiryDate().isBefore(LocalDateTime.now())) {
            throw new ConflictException(
                "This reset link has expired. Please request a new one."
            );
        }

        if (newPassword == null || newPassword.length() < 8) {
            throw new ConflictException(
                "New password must be at least 8 characters long"
            );
        }

        Users user = resetToken.getUser();
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepo.save(user);

        resetToken.setUsed(true);
        tokenRepo.save(resetToken);
    }

    private String generateToken() {
        return (
            UUID.randomUUID().toString().replace("-", "") +
            UUID.randomUUID().toString().replace("-", "")
        );
    }
}
