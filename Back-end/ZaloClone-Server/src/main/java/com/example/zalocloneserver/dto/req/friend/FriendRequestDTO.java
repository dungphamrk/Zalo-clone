package com.example.zalocloneserver.dto.req.friend;

import jakarta.validation.constraints.*;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FriendRequestDTO {

    @NotNull(message = "Recipient user ID is required")
    @Positive(message = "Recipient user ID must be positive")
    private Long toUserId;

    @Size(max = 500, message = "Message cannot exceed 500 characters")
    private String message;
}