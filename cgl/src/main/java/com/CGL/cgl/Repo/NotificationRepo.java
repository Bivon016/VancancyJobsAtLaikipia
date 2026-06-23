package com.CGL.cgl.Repo;

import com.CGL.cgl.Model.Notification;
import com.CGL.cgl.Model.Users;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface NotificationRepo extends JpaRepository<Notification, Long> {
    List<Notification> findByUserOrderByCreatedAtDesc(Users user);

    List<Notification> findByUserAndIsReadFalseOrderByCreatedAtDesc(Users user);
}
