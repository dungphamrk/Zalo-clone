package com.example.zalocloneserver.dto.res;

import com.example.zalocloneserver.dto.res.user.UserResponse;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class CommentResponse{
    private Long id;
    private String content;
    private UserResponse user;
    private String replyToUsername;
    private Long parentId;
    private int reactionCount;
    private boolean reactedByCurrentUser;
    private LocalDateTime createdAt;
    private List<CommentResponse> childComments;
}
