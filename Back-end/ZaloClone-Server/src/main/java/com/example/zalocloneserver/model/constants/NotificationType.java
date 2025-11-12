package com.example.zalocloneserver.model.constants;

public enum NotificationType {
    // Tin nhắn
    NEW_MESSAGE,
    MENTION,

    // Tương tác bài đăng
    NEW_POST, // Bạn bè đăng bài mới
    POST_REACTION, // Ai đó thích bài đăng của bạn
    NEW_COMMENT, // Ai đó bình luận bài đăng của bạn
    COMMENT_REPLY, // Ai đó trả lời bình luận của bạn

    // Kết bạn
    FRIEND_REQUEST_RECEIVED, // Nhận lời mời kết bạn
    FRIEND_REQUEST_ACCEPTED, // Lời mời kết bạn được chấp nhận

    // Hệ thống
    SYSTEM
}
