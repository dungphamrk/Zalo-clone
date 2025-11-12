package com.example.zalocloneserver.dto;

import com.example.zalocloneserver.model.constants.NotificationType;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class NotificationResponse {
    private Long id;
    private NotificationType type;
    private String message;
    private String referenceId; // ID của post, comment, user...
    private String actorAvatar;
    private boolean seen;
    private LocalDateTime createdAt;
}

