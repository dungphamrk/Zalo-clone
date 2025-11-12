package com.example.zalocloneserver.dto.res.post;

import com.example.zalocloneserver.dto.res.PostMediaResponse;
import com.example.zalocloneserver.dto.res.user.UserResponse;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class PostResponse{
    private Long id;
    private String content;
    private LocalDateTime createdAt;

    private UserResponse user;

    private List<PostMediaResponse> mediaList;

    private long totalReactions;
    private long totalComments;

    private boolean reactedByCurrentUser;
}