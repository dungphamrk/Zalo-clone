package com.example.zalocloneserver.dto.res.message;

import lombok.*;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MessageReactionResponse {
    private Long userId;
    private String userName;
    private String userAvatar;
    private String reaction;
    private LocalDateTime reactedAt;
}