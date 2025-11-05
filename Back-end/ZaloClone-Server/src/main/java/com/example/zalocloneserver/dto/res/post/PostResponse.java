package com.example.zalocloneserver.dto.res.post;

import com.example.zalocloneserver.dto.res.message.AttachmentResponse;
import com.example.zalocloneserver.dto.res.ReactionSummary;
import com.example.zalocloneserver.model.constants.PostType;
import com.example.zalocloneserver.model.constants.Visibility;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PostResponse {
    private Long id;
    private Long userId;
    private String userName;
    private String userAvatar;

    private PostType type;
    private String content;
    private String metadata;

    private Visibility visibility;
    private boolean allowComments;
    private boolean pinned;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    private Long commentCount;
    private Long reactionCount;
    private Long viewCount;

    private List<AttachmentResponse> attachments;

    private Map<String, ReactionSummary> reactionSummary;

    private List<PostCommentResponse> topComments;
    private Boolean isReactedByCurrentUser;
    private String currentUserReaction;
}