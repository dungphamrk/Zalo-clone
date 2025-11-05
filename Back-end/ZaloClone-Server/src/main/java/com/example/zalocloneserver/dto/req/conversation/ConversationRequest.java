package com.example.zalocloneserver.dto.req.conversation;

import com.example.zalocloneserver.model.constants.ConversationType;
import jakarta.validation.constraints.*;
import lombok.*;

import java.util.Set;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ConversationRequest {

    @NotNull(message = "Conversation type is required")
    private ConversationType type;

    @Size(max = 100, message = "Title cannot exceed 100 characters")
    private String title;

    @Size(max = 255, message = "Avatar URL cannot exceed 255 characters")
    private String avatarUrl;

    @NotNull(message = "Creator ID is required")
    @Positive(message = "Creator ID must be positive")
    private Long creatorId;

    private boolean isPublic;

    @NotEmpty(message = "At least one member is required")
    @Size(min = 2, message = "Conversation must have at least 2 members")
    private Set<@Positive(message = "Member user ID must be positive") Long> memberUserIds;
}