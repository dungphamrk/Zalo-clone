package com.example.zalocloneserver.dto.res.post;

import com.example.zalocloneserver.dto.res.ReactionSummary;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PostCommentResponse {
    private Long id;
    private Long postId;
    private Long userId;
    private String userName;
    private String userAvatar;

    private Long parentCommentId;
    private String comment;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private boolean deleted;

    private Long replyCount;
    private List<PostCommentResponse> replies;
    private Map<String, ReactionSummary> reactionSummary;
}