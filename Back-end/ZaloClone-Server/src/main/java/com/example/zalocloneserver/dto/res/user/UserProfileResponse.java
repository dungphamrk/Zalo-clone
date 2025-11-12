package com.example.zalocloneserver.dto.res.user;

import com.example.zalocloneserver.model.constants.Gender;
import com.example.zalocloneserver.model.constants.Presence;
import com.example.zalocloneserver.model.entity.UserProfile;
import lombok.*;

import java.time.LocalDateTime;
import java.util.Date;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserProfileResponse {
    private String avatarUrl;
    private Date birthday;
    private Gender gender;
    private String displayName;
    private LocalDateTime lastActive;
    private Presence presence;
    public static UserProfileResponse fromEntity(UserProfile profile) {
        if (profile == null) return null;
        return UserProfileResponse.builder()
                .displayName(profile.getDisplayName())
                .birthday(profile.getBirthday())
                .presence(profile.getPresence())
                .build();
    }
}