package com.example.zalocloneserver.dto.res.user;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserProfileMiniDto {
    private String displayName;
    private String avatarUrl;
    private String location;
}
