package com.example.zalocloneserver.dto.req.conversation;

import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ConversationSettingRequest {

    private boolean pinned;

    @FutureOrPresent(message = "Muted until must be now or in the future")
    private LocalDateTime mutedUntil;

    private boolean archived;

    @Size(max = 50, message = "Last read message ID cannot exceed 50 characters")
    private String lastReadMessageId;
}