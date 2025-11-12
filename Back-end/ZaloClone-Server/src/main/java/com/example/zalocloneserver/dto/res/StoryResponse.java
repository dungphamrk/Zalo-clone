package com.example.zalocloneserver.dto.res;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StoryResponse {
    private Long id;
    private Long userId;
    private String userName;
    private String userAvatar;
    private String mediaUrl;
    private String mediaType;
    private LocalDateTime createdAt;
    private LocalDateTime expiresAt;
    private boolean isViewed;
}

