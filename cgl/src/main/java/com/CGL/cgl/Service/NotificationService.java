package com.CGL.cgl.Service;

import com.CGL.cgl.DTO.NotificationResponseDTO;
import com.CGL.cgl.Model.Notification;
import com.CGL.cgl.Model.Users;
import java.util.List;

public interface NotificationService {
    Notification createNotification(Users user, String title, String message);

    List<NotificationResponseDTO> getMyNotifications(String email);

    List<NotificationResponseDTO> getUnreadNotifications(String email);

    NotificationResponseDTO markAsRead(Long notificationId, String email);
}
