package com.example.zalocloneserver.dto.res.friend;

import lombok.*;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FriendRequestResponse {
    private Long id;
    private Long fromUserId;
    private String fromUserName;
    private String message;
    private LocalDateTime createdAt;
}