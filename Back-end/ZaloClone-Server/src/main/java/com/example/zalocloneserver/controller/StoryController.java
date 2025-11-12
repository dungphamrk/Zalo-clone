package com.example.zalocloneserver.controller;

import com.example.zalocloneserver.dto.res.StoryResponse;
import com.example.zalocloneserver.dto.res.base.APIResponse;
import com.example.zalocloneserver.model.entity.Story;
import com.example.zalocloneserver.model.entity.User;
import com.example.zalocloneserver.repository.IStoryRepository;
import com.example.zalocloneserver.repository.IUserRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/stories")
@RequiredArgsConstructor
@SecurityRequirement(name = "Bearer Authentication")
@Tag(name = "Story", description = "API stories")
public class StoryController {

    private final IStoryRepository storyRepository;
    private final IUserRepository userRepository;

    @GetMapping
    @Operation(summary = "Lấy danh sách stories", description = "Lấy danh sách stories của bạn bè và người dùng hiện tại")
    public ResponseEntity<APIResponse<List<StoryResponse>>> getStories() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName();
        User currentUser = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Get active stories that haven't expired
        LocalDateTime now = LocalDateTime.now();
        List<Story> stories = storyRepository.findActiveStories(now);

        // Get viewed stories for current user (you can implement this later)
        Set<Long> viewedStoryIds = Set.of(); // TODO: Implement story views tracking

        List<StoryResponse> responses = stories.stream()
                .map(story -> {
                    User storyUser = story.getUser();
                    return StoryResponse.builder()
                            .id(story.getId())
                            .userId(storyUser.getId())
                            .userName(storyUser.getProfile() != null ? storyUser.getProfile().getDisplayName() : storyUser.getUsername())
                            .userAvatar(storyUser.getProfile() != null ? storyUser.getProfile().getAvatarUrl() : null)
                            .mediaUrl(story.getMediaUrl())
                            .mediaType(story.getMediaType())
                            .createdAt(story.getCreatedAt())
                            .expiresAt(story.getExpiresAt())
                            .isViewed(viewedStoryIds.contains(story.getId()))
                            .build();
                })
                .collect(Collectors.toList());

        return ResponseEntity.ok(APIResponse.success(responses, "Get stories successfully"));
    }
}

