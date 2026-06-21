package com.CGL.cgl.Service;

import com.CGL.cgl.Model.Notification;
import com.CGL.cgl.Model.Users;

import java.util.List;


public interface NotificationService {


    Notification createNotification(
            Users user,
            String title,
            String message
    );


    List<Notification> getMyNotifications(
            String email
    );


    List<Notification> getUnreadNotifications(
            String email
    );


    Notification markAsRead(
            Long notificationId,
            String email
    );

}