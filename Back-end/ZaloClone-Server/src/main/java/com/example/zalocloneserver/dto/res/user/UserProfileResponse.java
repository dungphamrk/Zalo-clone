package com.example.zalocloneserver.dto.res.user;

import com.example.zalocloneserver.model.constants.Gender;
import com.example.zalocloneserver.model.constants.Presence;
import lombok.*;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserProfileResponse {
    private String avatarUrl;
    private LocalDateTime birthday;
    private Gender gender;
    private LocalDateTime lastActive;
    private Presence presence;
}