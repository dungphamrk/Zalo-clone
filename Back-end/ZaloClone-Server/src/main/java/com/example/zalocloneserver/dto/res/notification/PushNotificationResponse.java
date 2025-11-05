package com.example.zalocloneserver.dto.res.notification;

import com.example.zalocloneserver.model.constants.PushStatus;
import lombok.*;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PushNotificationResponse {
    private Long id;
    private String title;
    private String body;
    private String data; // JSON
    private LocalDateTime sentAt;
    private PushStatus status;
    private LocalDateTime createdAt;
}