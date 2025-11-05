package com.example.zalocloneserver.dto.res.auth;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LoginRequest {
    @NotBlank
    private String identifier; // phone, email, or username

    @NotBlank
    private String password;

    private String deviceInfo;
    private String pushToken;
    private String ip;
}