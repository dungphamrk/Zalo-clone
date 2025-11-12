package com.example.zalocloneserver.dto.res.conversation;

import com.example.zalocloneserver.model.constants.ConversationType;
import lombok.*;

import java.time.LocalDateTime;
import java.util.Set;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ConversationResponse {
    private Long id;
    private ConversationType type;
    private String title;
    private String avatarUrl;
    private Long creatorId;
    private String creatorName;
    private LocalDateTime createdAt;
    private LocalDateTime lastMessageAt;
    private String lastMessage; // Content of the last message
    private Long lastMessageSenderId; // ID of the sender of last message
    private String lastMessageSenderName; // Name of the sender of last message
    private boolean isPublic;
    private Set<ConversationMemberResponse> members;
    private ConversationSettingResponse setting;
    private Long unreadCount; // Số tin nhắn chưa đọc
}