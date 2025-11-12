package com.example.zalocloneserver.dto.res.notification;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QueuedNotificationResponse {
    private Long id;
    private String destination;
    private String payloadJson;
    private LocalDateTime createdAt;
    private LocalDateTime deliveredAt;
    private int attempts;
}

