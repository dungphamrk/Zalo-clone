package com.example.zalocloneserver.dto.res.chat;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatNotification {
    private Long conversationId;
    private String username;
    private String message;
}

