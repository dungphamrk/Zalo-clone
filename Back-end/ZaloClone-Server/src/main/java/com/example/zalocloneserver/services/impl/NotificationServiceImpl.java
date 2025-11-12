package com.example.zalocloneserver.services.impl;

import com.example.zalocloneserver.dto.NotificationResponse;
import com.example.zalocloneserver.model.constants.NotificationType;
import com.example.zalocloneserver.model.entity.Conversation;
import com.example.zalocloneserver.model.entity.InAppNotification;
import com.example.zalocloneserver.model.entity.Message;
import com.example.zalocloneserver.model.entity.User;
import com.example.zalocloneserver.repository.IInAppNotificationRepository;
import com.example.zalocloneserver.repository.IMessageRepository;
import com.example.zalocloneserver.services.INotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class NotificationServiceImpl implements INotificationService {

    private final IInAppNotificationRepository notificationRepository;
    private final SimpMessagingTemplate messagingTemplate;
    private final IMessageRepository messageRepository;

    @Override
    @Transactional
    public void createAndSendNotification(User recipient, User actor, NotificationType type, String referenceId, String message) {
        // Không gửi thông báo nếu người thực hiện và người nhận là một
        if (actor != null && recipient.getId().equals(actor.getId())) {
            return;
        }

        InAppNotification notification = InAppNotification.builder()
                .user(recipient)
                .type(type)
                .referenceId(referenceId)
                .payload(message)
                .seen(false)
                .createdAt(java.time.LocalDateTime.now())
                .build();

        InAppNotification savedNotification = notificationRepository.save(notification);

        // Tạo DTO để gửi qua WebSocket
        NotificationResponse response = NotificationResponse.builder()
                .id(savedNotification.getId())
                .type(savedNotification.getType())
                .message(savedNotification.getPayload())
                .referenceId(savedNotification.getReferenceId())
                .actorAvatar(actor != null && actor.getProfile() != null ? actor.getProfile().getAvatarUrl() : null)
                .seen(savedNotification.isSeen())
                .createdAt(savedNotification.getCreatedAt())
                .build();

        // Gửi thông báo tới user cụ thể qua WebSocket
        // Topic sẽ là /user/{userId}/queue/notifications
        messagingTemplate.convertAndSendToUser(
                recipient.getUsername(), // Spring Security Principal name
                "/queue/notifications",
                response
        );
    }

    @Override
    public Page<NotificationResponse> getNotificationsForUser(User user, Pageable pageable) {
        Page<InAppNotification> notifications = notificationRepository.findByUserOrderByCreatedAtDesc(user, pageable);
        return notifications.map(n -> NotificationResponse.builder()
                .id(n.getId())
                .type(n.getType())
                .message(n.getPayload())
                .referenceId(n.getReferenceId())
                // TODO: Cần lấy thông tin actor từ payload hoặc referenceId
                .seen(n.isSeen())
                .createdAt(n.getCreatedAt())
                .build());
    }

    @Override
    @Transactional
    public long markAllAsSeen(User user) {
        long count = notificationRepository.countByUserAndSeen(user, false);
        if (count > 0) {
            notificationRepository.markAllAsSeenForUser(user);
        }
        return count;
    }

    @Override
    public long countUnseenNotifications(User user) {
        return notificationRepository.countByUserAndSeen(user, false);
    }

    @Override
    @Transactional
    public void deleteNotificationsByConversation(User user, Conversation conversation) {
        // Lấy tất cả messageId trong conversation
        List<Message> messages = messageRepository.findByConversationOrderByCreatedAtAsc(conversation);
        List<String> messageIds = messages.stream()
                .map(m -> m.getId().toString())
                .collect(Collectors.toList());
        
        if (!messageIds.isEmpty()) {
            // Xóa các notification có type NEW_MESSAGE và referenceId là messageId trong conversation
            notificationRepository.deleteByUserAndTypeAndReferenceIds(user, NotificationType.NEW_MESSAGE, messageIds);
        }
    }
    
    @Override
    @Transactional
    public long deleteAllNotifications(User user) {
        long count = notificationRepository.countByUser(user);
        notificationRepository.deleteAllByUser(user);
        return count;
    }
}

