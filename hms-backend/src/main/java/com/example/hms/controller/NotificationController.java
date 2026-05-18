package com.example.hms.controller;

import com.example.hms.dto.notification_dto.BroadcastRequestDto;
import com.example.hms.dto.notification_dto.NotificationDto;
import com.example.hms.service.NotificationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    /** Get all notifications for the current user (with read status) */
    @GetMapping
    public List<NotificationDto> getMyNotifications() {
        return notificationService.getMyNotifications();
    }

    /** Mark a single notification as read */
    @PutMapping("/{id}/read")
    public ResponseEntity<Map<String, String>> markAsRead(@PathVariable Long id) {
        notificationService.markAsRead(id);
        return ResponseEntity.ok(Map.of("message", "Notification marked as read"));
    }

    /** Mark all notifications as read */
    @PutMapping("/read-all")
    public ResponseEntity<Map<String, String>> markAllAsRead() {
        notificationService.markAllAsRead();
        return ResponseEntity.ok(Map.of("message", "All notifications marked as read"));
    }

    /** Admin broadcast — send notification to a target audience */
    @PostMapping("/broadcast")
    @PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN')")
    public ResponseEntity<NotificationDto> broadcast(@RequestBody @Valid BroadcastRequestDto request) {
        return ResponseEntity.ok(notificationService.broadcast(request));
    }

    /** Admin — get broadcast history */
    @GetMapping("/broadcast-history")
    @PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN')")
    public List<NotificationDto> getBroadcastHistory() {
        return notificationService.getBroadcastHistory();
    }
}
