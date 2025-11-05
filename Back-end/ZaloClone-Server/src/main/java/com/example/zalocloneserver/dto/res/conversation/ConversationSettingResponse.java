package com.example.zalocloneserver.dto.res.conversation;

import lombok.*;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ConversationSettingResponse {
    private Long conversationId;
    private Long userId;
    private boolean pinned;
    private LocalDateTime mutedUntil;
    private boolean archived;
    private String lastReadMessageId;
}
