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
    private String fromUsername;
    private String fromDisplayName;
    private String fromAvatar;
    private String message;
    private LocalDateTime createdAt;
}
