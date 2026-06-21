package com.CGL.cgl.Repo;

import com.CGL.cgl.Model.Notification;
import com.CGL.cgl.Model.Users;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;


@Repository
public interface NotificationRepo
        extends JpaRepository<Notification, Long> {


    List<Notification> findByUserOrderByCreatedAtDesc(
            Users user
    );


    List<Notification> findByUserAndIsReadFalse(
            Users user
    );

}