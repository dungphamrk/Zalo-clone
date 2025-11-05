package com.example.zalocloneserver.dto.res.message;

import com.example.zalocloneserver.model.constants.DeliveryStatus;
import lombok.*;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MessageStatusResponse {
    private Long userId;
    private String userName;
    private DeliveryStatus status;
    private LocalDateTime updatedAt;
}