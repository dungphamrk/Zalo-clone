package com.example.zalocloneserver.dto.res.conversation;


import lombok.*;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CallParticipantResponse {
    private Long userId;
    private String userName;
    private LocalDateTime joinedAt;
    private LocalDateTime leftAt;
}