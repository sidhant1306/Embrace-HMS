package com.example.hms.dao;

import com.example.hms.enums.Roles;
import com.example.hms.model.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {

    /**
     * Fetch notifications relevant to a specific user:
     * 1. Targeted at this user specifically (targetUserId = userId)
     * 2. Targeted at their role (targetRole = userRole)
     * 3. Global broadcast (targetUserId IS NULL AND targetRole IS NULL)
     * Ordered newest first, limited to last 50.
     */
    @Query("SELECT n FROM Notification n WHERE " +
           "n.targetUserId = :userId " +
           "OR n.targetRole = :role " +
           "OR (n.targetUserId IS NULL AND n.targetRole IS NULL) " +
           "ORDER BY n.createdAt DESC")
    List<Notification> findForUser(@Param("userId") Integer userId, @Param("role") Roles role);

    /** All notifications sent by admin (for admin history view) */
    @Query("SELECT n FROM Notification n WHERE n.senderName IS NOT NULL ORDER BY n.createdAt DESC")
    List<Notification> findAllBroadcasts();
}
