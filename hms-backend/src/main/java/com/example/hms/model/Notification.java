package com.example.hms.model;

import com.example.hms.enums.Roles;
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
@Table(name = "notifications")
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** If set, this notification targets a specific user */
    private Integer targetUserId;

    /** If set, this notification targets all users with this role.
     *  null + null targetUserId = broadcast to ALL */
    @Enumerated(EnumType.STRING)
    private Roles targetRole;

    @Column(nullable = false, length = 255)
    private String title;

    @Column(nullable = false, length = 2000)
    private String message;

    /** INFO, SUCCESS, WARNING, ERROR */
    @Column(nullable = false, length = 20)
    private String type;

    /** Who sent it (e.g. "Admin", "System") */
    @Column(length = 120)
    private String senderName;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @PrePersist
    void prePersist() {
        if (createdAt == null) createdAt = LocalDateTime.now();
        if (type == null) type = "info";
    }
}
