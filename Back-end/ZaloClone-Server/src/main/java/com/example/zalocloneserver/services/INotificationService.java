package com.example.zalocloneserver.services;

import com.example.zalocloneserver.dto.NotificationResponse;
import com.example.zalocloneserver.model.constants.NotificationType;
import com.example.zalocloneserver.model.entity.Conversation;
import com.example.zalocloneserver.model.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface INotificationService {

    /**
     * Tạo và lưu một thông báo mới, sau đó đẩy qua WebSocket.
     * @param recipient Người nhận thông báo
     * @param actor Người thực hiện hành động (có thể là null cho thông báo hệ thống)
     * @param type Loại thông báo
     * @param referenceId ID của đối tượng liên quan (post, comment, user...)
     * @param message Nội dung thông báo
     */
    void createAndSendNotification(User recipient, User actor, NotificationType type, String referenceId, String message);

    /**
     * Lấy danh sách thông báo cho người dùng hiện tại (phân trang).
     * @param user Người dùng
     * @param pageable Thông tin phân trang
     * @return Trang thông báo
     */
    Page<NotificationResponse> getNotificationsForUser(User user, Pageable pageable);

    /**
     * Đánh dấu tất cả thông báo của người dùng là đã xem.
     * @param user Người dùng
     * @return Số lượng thông báo đã được đánh dấu
     */
    long markAllAsSeen(User user);

    /**
     * Đếm số lượng thông báo chưa xem của người dùng.
     * @param user Người dùng
     * @return Số lượng thông báo chưa xem
     */
    long countUnseenNotifications(User user);

    /**
     * Xóa các notification liên quan đến conversation (NEW_MESSAGE notifications)
     * @param user Người dùng
     * @param conversation Conversation
     */
    void deleteNotificationsByConversation(User user, Conversation conversation);
    
    /**
     * Xóa tất cả thông báo của người dùng.
     * @param user Người dùng
     * @return Số lượng thông báo đã xóa
     */
    long deleteAllNotifications(User user);
}

