package com.example.zalocloneserver.dto.res.user;

import com.example.zalocloneserver.model.constants.UserStatus;
import lombok.*;


@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserResponse {
    private Long id;
    private String phone;
    private String email;
    private String displayName;
    private UserStatus status;
    private UserProfileResponse profile;
}