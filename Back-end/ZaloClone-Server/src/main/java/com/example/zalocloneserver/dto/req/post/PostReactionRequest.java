package com.example.zalocloneserver.dto.req.post;

import jakarta.validation.constraints.*;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PostReactionRequest {

    @NotNull @Positive
    private Long postId;

    @NotNull @Positive
    private Long userId;

    @NotBlank
    @Size(min = 1, max = 10)
    private String reaction;
}