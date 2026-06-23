package com.CGL.cgl.Service;

import com.CGL.cgl.DTO.NotificationResponseDTO;
import com.CGL.cgl.Model.Notification;
import com.CGL.cgl.Model.Users;
import com.CGL.cgl.Repo.NotificationRepo;
import com.CGL.cgl.Repo.UserRepo;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepo notificationRepo;

    private final UserRepo userRepo;

    public NotificationServiceImpl(
        NotificationRepo notificationRepo,
        UserRepo userRepo
    ) {
        this.notificationRepo = notificationRepo;
        this.userRepo = userRepo;
    }

    @Override
    public Notification createNotification(
        Users user,
        String title,
        String message
    ) {
        Notification notification = Notification.builder()
            .user(user)
            .title(title)
            .message(message)
            .isRead(false)
            .build();

        return notificationRepo.save(notification);
    }

    @Override
    @Transactional(readOnly = true)
    public List<NotificationResponseDTO> getMyNotifications(String email) {
        Users user = userRepo
            .findByEmail(email)
            .orElseThrow(() -> new RuntimeException("User not found"));

        return notificationRepo
            .findByUserOrderByCreatedAtDesc(user)
            .stream()
            .map(this::toResponse)
            .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<NotificationResponseDTO> getUnreadNotifications(String email) {
        Users user = userRepo
            .findByEmail(email)
            .orElseThrow(() -> new RuntimeException("User not found"));

        return notificationRepo
            .findByUserAndIsReadFalseOrderByCreatedAtDesc(user)
            .stream()
            .map(this::toResponse)
            .toList();
    }

    @Override
    @Transactional
    public NotificationResponseDTO markAsRead(
        Long notificationId,
        String email
    ) {
        Users user = userRepo
            .findByEmail(email)
            .orElseThrow(() -> new RuntimeException("User not found"));
        Notification notification = notificationRepo
            .findById(notificationId)
            .orElseThrow(() -> new RuntimeException("Notification not found"));

        if (!notification.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("You cannot access this notification");
        }

        notification.setIsRead(true);

        return toResponse(notificationRepo.save(notification));
    }

    private NotificationResponseDTO toResponse(Notification notification) {
        return NotificationResponseDTO.builder()
            .id(notification.getId())
            .title(notification.getTitle())
            .message(notification.getMessage())
            .isRead(notification.getIsRead())
            .createdAt(notification.getCreatedAt())
            .build();
    }
}
