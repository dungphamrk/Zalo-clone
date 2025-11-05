package com.example.zalocloneserver.dto.res.message;

import com.example.zalocloneserver.model.constants.MessageType;
import lombok.*;

import java.time.LocalDateTime;
import java.util.Set;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MessageResponse {
    private Long id;
    private Long conversationId;
    private Long senderId;
    private String senderName;
    private String senderAvatar;

    private MessageType type;
    private String content;
    private String metadata;
    private LocalDateTime createdAt;
    private LocalDateTime editedAt;
    private boolean deleted;

    private String replyToMessageId;
    private MessageResponse replyTo; // nested nếu cần

    private Set<AttachmentResponse> attachments;
    private Set<MessageReactionResponse> reactions;
    private Set<MessageStatusResponse> statuses; // đã xem, đã gửi...
}