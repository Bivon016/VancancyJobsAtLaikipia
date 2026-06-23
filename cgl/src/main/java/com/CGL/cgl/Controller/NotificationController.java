package com.CGL.cgl.Controller;

import com.CGL.cgl.DTO.NotificationResponseDTO;
import com.CGL.cgl.Service.NotificationService;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/notifications")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @PreAuthorize("isAuthenticated()")
    @GetMapping("/my")
    public ResponseEntity<List<NotificationResponseDTO>> getMyNotifications() {
        String email = SecurityContextHolder.getContext()
            .getAuthentication()
            .getName();

        return ResponseEntity.ok(notificationService.getMyNotifications(email));
    }

    @PreAuthorize("isAuthenticated()")
    @GetMapping("/unread")
    public ResponseEntity<List<NotificationResponseDTO>> getUnread() {
        String email = SecurityContextHolder.getContext()
            .getAuthentication()
            .getName();

        return ResponseEntity.ok(
            notificationService.getUnreadNotifications(email)
        );
    }

    @PreAuthorize("isAuthenticated()")
    @PutMapping("/{id}/read")
    public ResponseEntity<NotificationResponseDTO> markAsRead(
        @PathVariable Long id
    ) {
        String email = SecurityContextHolder.getContext()
            .getAuthentication()
            .getName();

        return ResponseEntity.ok(notificationService.markAsRead(id, email));
    }
}
