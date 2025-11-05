package com.example.zalocloneserver.dto.res.notification;

import com.example.zalocloneserver.model.constants.NotificationType;
import lombok.*;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InAppNotificationResponse {
    private Long id;
    private NotificationType type;
    private String title;        // tự sinh: "A bình luận bài của bạn"
    private String message;      // nội dung ngắn
    private String referenceId;  // postId, messageId, commentId
    private String payload;      // JSON chi tiết
    private boolean seen;
    private LocalDateTime createdAt;

    // Dành cho frontend
    private String avatarUrl;
    private String actionUrl;    // /post/123, /chat/456
}