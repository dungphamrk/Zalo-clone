package com.example.zalocloneserver.dto.res.friend;

import lombok.*;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FriendRequestSentResponse {

    private Long id; // ID của request
    private Long toUserId; // Người nhận lời mời
    private String toUsername; // Tên người nhận
    private String toAvatar; // Ảnh đại diện người nhận
    private String message; // Nội dung lời mời
    private LocalDateTime createdAt; // Ngày gửi
}
