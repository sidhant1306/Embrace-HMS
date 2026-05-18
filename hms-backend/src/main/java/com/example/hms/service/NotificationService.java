package com.example.hms.service;

import com.example.hms.dao.NotificationReadStatusRepository;
import com.example.hms.dao.NotificationRepository;
import com.example.hms.dao.UserRepository;
import com.example.hms.dto.notification_dto.BroadcastRequestDto;
import com.example.hms.dto.notification_dto.NotificationDto;
import com.example.hms.enums.Roles;
import com.example.hms.exception.ResourceNotFoundException;
import com.example.hms.model.Notification;
import com.example.hms.model.NotificationReadStatus;
import com.example.hms.model.profileModel.User;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final NotificationReadStatusRepository readStatusRepository;
    private final UserRepository userRepository;

    public NotificationService(NotificationRepository notificationRepository,
                               NotificationReadStatusRepository readStatusRepository,
                               UserRepository userRepository) {
        this.notificationRepository = notificationRepository;
        this.readStatusRepository = readStatusRepository;
        this.userRepository = userRepository;
    }

    /** Get all notifications for the currently logged-in user */
    @Transactional(readOnly = true)
    public List<NotificationDto> getMyNotifications() {
        User user = getCurrentUser();
        List<Notification> notifications = notificationRepository.findForUser(user.getUserId(), user.getUserRole());

        // Batch load read statuses
        List<Long> notifIds = notifications.stream().map(Notification::getId).toList();
        Set<Long> readIds = readStatusRepository.findByUserIdAndNotificationIdIn(user.getUserId(), notifIds)
                .stream()
                .map(NotificationReadStatus::getNotificationId)
                .collect(Collectors.toSet());

        return notifications.stream()
                .map(n -> NotificationDto.builder()
                        .id(n.getId())
                        .title(n.getTitle())
                        .message(n.getMessage())
                        .type(n.getType())
                        .senderName(n.getSenderName())
                        .createdAt(n.getCreatedAt())
                        .read(readIds.contains(n.getId()))
                        .build())
                .toList();
    }

    /** Mark a single notification as read for the current user */
    @Transactional
    public void markAsRead(Long notificationId) {
        User user = getCurrentUser();
        if (!readStatusRepository.existsByNotificationIdAndUserId(notificationId, user.getUserId())) {
            readStatusRepository.save(NotificationReadStatus.builder()
                    .notificationId(notificationId)
                    .userId(user.getUserId())
                    .readAt(LocalDateTime.now())
                    .build());
        }
    }

    /** Mark all notifications as read for the current user */
    @Transactional
    public void markAllAsRead() {
        User user = getCurrentUser();
        List<Notification> notifications = notificationRepository.findForUser(user.getUserId(), user.getUserRole());
        List<Long> notifIds = notifications.stream().map(Notification::getId).toList();
        Set<Long> alreadyRead = readStatusRepository.findByUserIdAndNotificationIdIn(user.getUserId(), notifIds)
                .stream()
                .map(NotificationReadStatus::getNotificationId)
                .collect(Collectors.toSet());

        List<NotificationReadStatus> toSave = notifIds.stream()
                .filter(id -> !alreadyRead.contains(id))
                .map(id -> NotificationReadStatus.builder()
                        .notificationId(id)
                        .userId(user.getUserId())
                        .readAt(LocalDateTime.now())
                        .build())
                .toList();

        if (!toSave.isEmpty()) {
            readStatusRepository.saveAll(toSave);
        }
    }

    /** Admin broadcast — send a notification to a target audience */
    @Transactional
    public NotificationDto broadcast(BroadcastRequestDto request) {
        User admin = getCurrentUser();

        Roles targetRole = null;
        if (!"ALL".equalsIgnoreCase(request.getTargetAudience())) {
            targetRole = Roles.valueOf(request.getTargetAudience().toUpperCase());
        }

        Notification notification = Notification.builder()
                .title(request.getTitle())
                .message(request.getMessage())
                .type(request.getType() != null ? request.getType() : "info")
                .targetRole(targetRole)
                .targetUserId(null)
                .senderName(admin.getUserName())
                .createdAt(LocalDateTime.now())
                .build();

        Notification saved = notificationRepository.save(notification);

        return NotificationDto.builder()
                .id(saved.getId())
                .title(saved.getTitle())
                .message(saved.getMessage())
                .type(saved.getType())
                .senderName(saved.getSenderName())
                .createdAt(saved.getCreatedAt())
                .read(false)
                .build();
    }

    /** Get broadcast history for admin view */
    @Transactional(readOnly = true)
    public List<NotificationDto> getBroadcastHistory() {
        return notificationRepository.findAllBroadcasts().stream()
                .map(n -> NotificationDto.builder()
                        .id(n.getId())
                        .title(n.getTitle())
                        .message(n.getMessage())
                        .type(n.getType())
                        .senderName(n.getSenderName())
                        .createdAt(n.getCreatedAt())
                        .read(true)
                        .build())
                .toList();
    }

    // ── Utility methods for auto-notifications ──

    /** Send a notification to a specific user by ID */
    public void notifyUser(Integer userId, String title, String message, String type) {
        notificationRepository.save(Notification.builder()
                .targetUserId(userId)
                .title(title)
                .message(message)
                .type(type != null ? type : "info")
                .senderName("System")
                .createdAt(LocalDateTime.now())
                .build());
    }

    /** Send a notification to all users of a specific role */
    public void notifyRole(Roles role, String title, String message, String type) {
        notificationRepository.save(Notification.builder()
                .targetRole(role)
                .title(title)
                .message(message)
                .type(type != null ? type : "info")
                .senderName("System")
                .createdAt(LocalDateTime.now())
                .build());
    }

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByUserEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }
}
