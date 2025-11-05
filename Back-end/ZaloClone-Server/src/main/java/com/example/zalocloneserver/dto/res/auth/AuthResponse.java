package com.example.zalocloneserver.dto.res.auth;


import com.example.zalocloneserver.dto.res.user.UserResponse;
import com.example.zalocloneserver.dto.res.user.UserSessionResponse;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuthResponse {
    private UserResponse user;
    private String accessToken;
    private String refreshToken;
    private Long expiresIn; // seconds
    private UserSessionResponse session;
}
