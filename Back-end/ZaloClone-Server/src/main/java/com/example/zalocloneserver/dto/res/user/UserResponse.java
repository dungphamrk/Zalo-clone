package com.example.zalocloneserver.dto.res.user;

import com.example.zalocloneserver.model.constants.Role;
import com.example.zalocloneserver.model.constants.UserStatus;
import lombok.*;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserResponse {
    private Long id;
    private String phone;
    private String email;
    private String username;
    private String displayName;

    private Role role;
    private UserStatus status;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    private UserProfileResponse profile;
    private Presence presence; // từ profile
    private boolean isOnline;
}