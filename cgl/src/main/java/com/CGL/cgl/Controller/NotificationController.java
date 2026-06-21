package com.CGL.cgl.Controller;


import com.CGL.cgl.Model.Notification;
import com.CGL.cgl.Service.NotificationService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;


import java.util.List;



@RestController
@RequestMapping("/notifications")
public class NotificationController {


    private final NotificationService notificationService;



    public NotificationController(
            NotificationService notificationService
    ){

        this.notificationService =
                notificationService;

    }




    @GetMapping("/my")
    public ResponseEntity<List<Notification>> getMyNotifications(){


        String email =
                SecurityContextHolder
                        .getContext()
                        .getAuthentication()
                        .getName();



        return ResponseEntity.ok(
                notificationService
                        .getMyNotifications(email)
        );

    }






    @GetMapping("/unread")
    public ResponseEntity<List<Notification>> getUnread(){


        String email =
                SecurityContextHolder
                        .getContext()
                        .getAuthentication()
                        .getName();



        return ResponseEntity.ok(
                notificationService
                        .getUnreadNotifications(email)
        );

    }







    @PutMapping("/{id}/read")
    public ResponseEntity<Notification> markAsRead(

            @PathVariable Long id

    ){


        String email =
                SecurityContextHolder
                        .getContext()
                        .getAuthentication()
                        .getName();



        return ResponseEntity.ok(

                notificationService
                        .markAsRead(id,email)

        );

    }

}