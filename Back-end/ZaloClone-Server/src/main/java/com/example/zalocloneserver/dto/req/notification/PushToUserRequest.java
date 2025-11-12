package com.example.zalocloneserver.dto.req.notification;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PushToUserRequest {
    private String username; // target username (principal name)
    private String destination; // e.g. "/queue/notifications" or "custom-dest"
    private Object payload;
}

