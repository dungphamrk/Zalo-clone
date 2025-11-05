package com.example.zalocloneserver.dto.req.conversation;
import com.example.zalocloneserver.model.constants.CallType;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CallRequest {

    @NotNull(message = "Conversation ID is required")
    @Positive(message = "Conversation ID must be positive")
    private Long conversationId;

    @NotNull(message = "Call type is required")
    private CallType callType;

    @NotNull(message = "Initiator ID is required")
    @Positive(message = "Initiator ID must be positive")
    private Long initiatorId;

    @Size(max = 1000, message = "Metadata cannot exceed 1000 characters")
    private String metadata;
}