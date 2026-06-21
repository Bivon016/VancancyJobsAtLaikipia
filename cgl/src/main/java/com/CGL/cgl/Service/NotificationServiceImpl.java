package com.CGL.cgl.Service;

import com.CGL.cgl.Model.Notification;
import com.CGL.cgl.Model.Users;
import com.CGL.cgl.Repo.NotificationRepo;
import com.CGL.cgl.Repo.UserRepo;
import org.springframework.stereotype.Service;

import java.util.List;


@Service
public class NotificationServiceImpl
        implements NotificationService {


    private final NotificationRepo notificationRepo;

    private final UserRepo userRepo;



    public NotificationServiceImpl(
            NotificationRepo notificationRepo,
            UserRepo userRepo
    ){

        this.notificationRepo = notificationRepo;
        this.userRepo = userRepo;

    }




    @Override
    public Notification createNotification(
            Users user,
            String title,
            String message
    ){


        Notification notification =
                Notification.builder()
                        .user(user)
                        .title(title)
                        .message(message)
                        .isRead(false)
                        .build();



        return notificationRepo.save(notification);

    }





    @Override
    public List<Notification> getMyNotifications(
            String email
    ){

        Users user =
                userRepo.findByEmail(email)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "User not found"
                                )
                        );


        return notificationRepo
                .findByUserOrderByCreatedAtDesc(user);

    }





    @Override
    public List<Notification> getUnreadNotifications(
            String email
    ){

        Users user =
                userRepo.findByEmail(email)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "User not found"
                                )
                        );


        return notificationRepo
                .findByUserAndIsReadFalse(user);

    }





    @Override
    public Notification markAsRead(
            Long notificationId,
            String email
    ){


        Users user = userRepo.findByEmail(email)
                        .orElseThrow(() -> new RuntimeException("User not found"));
        Notification notification = notificationRepo.findById(notificationId)
                        .orElseThrow(() -> new RuntimeException("Notification not found"));

        if(!notification.getUser().getId()
                .equals(user.getId())){


            throw new RuntimeException(
                    "You cannot access this notification"
            );

        }



        notification.setIsRead(true);


        return notificationRepo.save(notification);

    }

}