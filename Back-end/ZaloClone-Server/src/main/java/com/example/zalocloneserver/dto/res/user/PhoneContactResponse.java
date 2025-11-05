package com.example.zalocloneserver.dto.res.user;

import lombok.*;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PhoneContactResponse {
    private Long id;
    private Long ownerUserId;
    private String contactName;
    private String contactPhone;
    private String normalizedPhone;
    private LocalDateTime importedAt;

    private boolean isRegisteredOnApp;  // có tài khoản Zalo không
    private Long appUserId;             // nếu có
    private String appUserAvatar;
}