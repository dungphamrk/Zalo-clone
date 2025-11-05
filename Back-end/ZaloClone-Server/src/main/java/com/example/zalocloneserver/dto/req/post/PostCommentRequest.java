package com.example.zalocloneserver.dto.req.post;

import jakarta.validation.constraints.*;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PostCommentRequest {

    @NotNull @Positive
    private Long postId;

    @NotNull @Positive
    private Long userId;

    private Long parentCommentId; // null nếu là comment gốc

    @NotBlank
    @Size(max = 2000, message = "Comment too long")
    private String comment;
}