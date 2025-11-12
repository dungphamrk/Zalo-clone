package com.example.zalocloneserver.dto.res;



import com.example.zalocloneserver.dto.res.user.UserProfileResponse;
import com.example.zalocloneserver.dto.res.user.UserResponse;
import com.example.zalocloneserver.model.entity.Comment;
import com.example.zalocloneserver.model.entity.User;

import java.util.ArrayList;

public class CommentMapper{
    public static CommentResponse mapToCommentResponse(Comment comment, User currentUser) {

        CommentResponse response = CommentResponse.builder()
                .id(comment.getId())
                .content(comment.getContent())
                .user(UserResponse.builder()
                        .id(comment.getUser().getId())
                        .username(comment.getUser().getUsername())
                        .profile(UserProfileResponse.fromEntity( comment.getUser().getProfile()))
                        .build())
                .createdAt(comment.getCreatedAt())
                .reactionCount(comment.getReactions() != null ? comment.getReactions().size() : 0)
                .reactedByCurrentUser(comment.getReactions() != null &&
                        comment.getReactions().stream().anyMatch(r -> r.getUser().getId().equals(currentUser.getId())))
                .replyToUsername(comment.getParentComment() != null ? comment.getParentComment().getUser().getUsername() : null)
                .parentId(comment.getParentComment() != null ? comment.getParentComment().getId() : null)
                .childComments(new ArrayList<>())
                .build();

        if (comment.getChildComments() != null) {
            for (Comment child : comment.getChildComments()) {
                response.getChildComments().add(mapToCommentResponse(child, currentUser));
            }
        }

        return response;
    }

}
