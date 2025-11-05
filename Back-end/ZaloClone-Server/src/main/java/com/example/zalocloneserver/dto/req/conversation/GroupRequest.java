package com.example.zalocloneserver.dto.req.conversation;

import com.example.zalocloneserver.model.constants.GroupType;
import jakarta.validation.constraints.*;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GroupRequest {

    @NotNull(message = "Conversation ID is required")
    @Positive(message = "Conversation ID must be positive")
    private Long conversationId;

    @NotNull(message = "Group type is required")
    private GroupType groupType;

    @Size(max = 100, message = "Invite token cannot exceed 100 characters")
    private String inviteToken;

    @Min(value = 1, message = "Invite expires in must be at least 1 hour")
    @Max(value = 720, message = "Invite cannot expire in more than 720 hours (30 days)")
    private Integer inviteExpiresInHours;
}