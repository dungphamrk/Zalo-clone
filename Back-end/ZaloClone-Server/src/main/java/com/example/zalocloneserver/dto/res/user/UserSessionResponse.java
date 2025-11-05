package com.example.zalocloneserver.dto.res.user;

import lombok.*;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserSessionResponse {
    private Long id;
    private Long userId;
    private String deviceInfo;
    private String ip;
    private LocalDateTime createdAt;
    private LocalDateTime lastSeen;
    private LocalDateTime expiresAt;
    private boolean isCurrentSession;
}