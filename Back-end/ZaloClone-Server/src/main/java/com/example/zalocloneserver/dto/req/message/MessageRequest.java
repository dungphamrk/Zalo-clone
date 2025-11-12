package com.example.zalocloneserver.dto.req.message;

import com.example.zalocloneserver.model.constants.MessageType;
import com.example.zalocloneserver.model.entity.Message;
import jakarta.validation.constraints.*;
import lombok.*;

import java.util.Set;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MessageRequest {

    @NotNull(message = "Conversation ID is required")
    @Positive
    private Long conversationId;

    @NotNull(message = "Sender ID is required")
    @Positive
    private Long senderId;

    @NotNull(message = "Message type is required")
    private MessageType type;

    @Size(max = 4000, message = "Content too long")
    private String content;

    private Long replyToMessageId;

    @Size(max = 10, message = "Max 10 attachments")
    private Set<AttachmentUploadRequest> attachments;

    @Size(max = 1000, message = "Metadata too long")
    private String metadata;

    public MessageRequest(Message message) {
        this.conversationId = message.getConversation().getId();
        this.type = message.getType();
        this.content = message.getContent();
        this.metadata = message.getMetadata();
        this.replyToMessageId = message.getReplyTo() != null ? message.getReplyTo().getId() : null;
        this.senderId = message.getSender().getId();
    }
}