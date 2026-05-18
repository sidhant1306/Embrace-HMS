package com.example.hms.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Entity
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "notification_read_status",
       uniqueConstraints = @UniqueConstraint(columnNames = {"notification_id", "user_id"}))
public class NotificationReadStatus {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "notification_id", nullable = false)
    private Long notificationId;

    @Column(name = "user_id", nullable = false)
    private Integer userId;

    private LocalDateTime readAt;

    @PrePersist
    void prePersist() {
        if (readAt == null) readAt = LocalDateTime.now();
    }
}
