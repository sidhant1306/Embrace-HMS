package com.example.hms.dao;

import com.example.hms.model.NotificationReadStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface NotificationReadStatusRepository extends JpaRepository<NotificationReadStatus, Long> {

    Optional<NotificationReadStatus> findByNotificationIdAndUserId(Long notificationId, Integer userId);

    List<NotificationReadStatus> findByUserIdAndNotificationIdIn(Integer userId, List<Long> notificationIds);

    boolean existsByNotificationIdAndUserId(Long notificationId, Integer userId);
}
