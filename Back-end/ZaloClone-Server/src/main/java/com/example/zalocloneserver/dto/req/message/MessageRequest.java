package com.example.zalocloneserver.dto.req.message;

import com.example.zalocloneserver.model.constants.MessageType;
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

    private String replyToMessageId;

    @Size(max = 10, message = "Max 10 attachments")
    private Set<AttachmentUploadRequest> attachments;

    @Size(max = 1000, message = "Metadata too long")
    private String metadata;
}