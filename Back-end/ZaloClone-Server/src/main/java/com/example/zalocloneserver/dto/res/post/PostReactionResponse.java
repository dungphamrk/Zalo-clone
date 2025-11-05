package com.example.zalocloneserver.dto.res.post;

import lombok.*;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PostReactionResponse {
    private Long userId;
    private String userName;
    private String userAvatar;
    private String reaction;
    private LocalDateTime reactedAt;
}