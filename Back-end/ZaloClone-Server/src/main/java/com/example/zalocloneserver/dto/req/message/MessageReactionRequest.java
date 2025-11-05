package com.example.zalocloneserver.dto.req.message;

import jakarta.validation.constraints.*;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MessageReactionRequest {

    @NotNull @Positive
    private Long messageId;

    @NotNull @Positive
    private Long userId;

    @NotBlank
    @Size(min = 1, max = 10, message = "Reaction must be 1-10 chars")
    private String reaction; // e.g. heart, like, haha
}