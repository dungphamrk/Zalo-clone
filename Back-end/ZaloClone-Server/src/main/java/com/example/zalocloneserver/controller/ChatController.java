package com.example.zalocloneserver.controller;

import com.example.zalocloneserver.dto.req.message.MessageRequest;
import com.example.zalocloneserver.dto.req.message.ReactionRequest;
import com.example.zalocloneserver.model.entity.User;
import com.example.zalocloneserver.repository.IUserRepository;
import com.example.zalocloneserver.services.impl.MessageService;
import com.example.zalocloneserver.services.impl.ReactionService;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessageSendingOperations;
import org.springframework.stereotype.Controller;
import java.security.Principal;

@Controller
@RequiredArgsConstructor
public class ChatController {

    private final MessageService messageService;
    private final ReactionService reactionService;
    private final IUserRepository userRepository; // Dùng để tìm User từ Principal
    private final SimpMessageSendingOperations messagingTemplate;

    /**
     * Xử lý tin nhắn đến từ WebSocket
     * Endpoint: /app/chat/{conversationId}
     */
    @MessageMapping("/chat/{conversationId}")
    public void sendMessage(
            @DestinationVariable Long conversationId,
            @Payload MessageRequest messagePayload,
            Principal principal // Spring Security cung cấp thông tin người dùng đã xác thực
    ) {
        // Giả sử Principal.getName() trả về email/username duy nhất
        String userIdentifier = principal.getName();

        // Lấy User Entity từ DB
        User sender = userRepository.findByUsername(userIdentifier)
                .orElseThrow(() -> new SecurityException("User not authenticated or found."));

        // Ensure conversationId in payload matches path (if provided), and set senderId from authenticated user
        if (messagePayload.getConversationId() != null && !messagePayload.getConversationId().equals(conversationId)) {
            throw new SecurityException("Conversation ID mismatch between path and payload.");
        }
        messagePayload.setConversationId(conversationId);
        messagePayload.setSenderId(sender.getId());

        // Gọi Service để lưu DB và broadcast
        messageService.saveAndBroadcast(conversationId, sender, messagePayload);
    }

    // Endpoint để thông báo 1 user vừa join 1 conversation
    @MessageMapping("/chat.join/{conversationId}")
    public void joinConversation(@DestinationVariable Long conversationId, Principal principal) {
        String username = principal.getName();

        com.example.zalocloneserver.dto.res.chat.ChatNotification notification = new com.example.zalocloneserver.dto.res.chat.ChatNotification(conversationId, username, "joined");

        String topicDestination = "/topic/chat/" + conversationId;
        messagingTemplate.convertAndSend(topicDestination, notification);
    }

    // Reaction handler via WebSocket
    @MessageMapping("/chat.reaction/{conversationId}")
    public void handleReaction(@DestinationVariable Long conversationId, @Payload ReactionRequest req, Principal principal) {
        String username = principal.getName();

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new SecurityException("User not authenticated or found."));

        if ("add".equalsIgnoreCase(req.getAction())) {
            reactionService.addReaction(req.getMessageId(), user.getId(), req.getReaction(), conversationId);
        } else {
            reactionService.removeReaction(req.getMessageId(), user.getId(), req.getReaction(), conversationId);
        }
    }

    // Cần thêm các phương thức khác như:
    // - /app/chat.read/{messageId} (để cập nhật trạng thái đã xem)
}
