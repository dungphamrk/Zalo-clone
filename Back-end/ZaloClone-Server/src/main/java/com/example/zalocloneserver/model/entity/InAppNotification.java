package com.example.zalocloneserver.model.entity;

import com.example.zalocloneserver.model.constants.NotificationType;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "in_app_notifications")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InAppNotification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "userId")
    private User user;

    @Enumerated(EnumType.STRING)
    private NotificationType type;

    private String referenceId;
    private String payload;
    private boolean seen;
    private LocalDateTime createdAt;
}