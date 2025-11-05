package com.example.zalocloneserver.dto.res.friend;

import lombok.*;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FriendResponse {
    private Long friendId;
    private String friendName;
    private String avatarUrl;
    private LocalDateTime since;
}