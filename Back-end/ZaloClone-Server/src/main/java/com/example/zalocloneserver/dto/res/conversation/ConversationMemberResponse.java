package com.example.zalocloneserver.dto.res.conversation;

import com.example.zalocloneserver.model.constants.MemberRole;
import lombok.*;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ConversationMemberResponse {
    private Long userId;
    private String userName;
    private String avatarUrl;
    private MemberRole role;
    private LocalDateTime joinedAt;
    private LocalDateTime muteUntil;
}