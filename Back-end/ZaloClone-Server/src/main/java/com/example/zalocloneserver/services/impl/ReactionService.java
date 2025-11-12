package com.example.zalocloneserver.services.impl;

import com.example.zalocloneserver.dto.res.message.MessageReactionResponse;
import com.example.zalocloneserver.model.entity.Message;
import com.example.zalocloneserver.model.entity.MessageReaction;
import com.example.zalocloneserver.model.entity.User;
import com.example.zalocloneserver.repository.IMessageReactionRepository;
import com.example.zalocloneserver.repository.IMessageRepository;
import com.example.zalocloneserver.repository.IUserRepository;
import com.example.zalocloneserver.services.IReactionService;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.messaging.simp.SimpMessageSendingOperations;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReactionService implements IReactionService {

    private final IMessageReactionRepository reactionRepository;
    private final IMessageRepository messageRepository;
    private final IUserRepository userRepository;
    private final SimpMessageSendingOperations messagingTemplate;

    @Transactional
    public void addReaction(Long messageId, Long userId, String reaction, Long conversationId) {
        Message message = messageRepository.findById(messageId).orElseThrow(() -> new IllegalArgumentException("Message not found"));
        User user = userRepository.findById(userId).orElseThrow(() -> new IllegalArgumentException("User not found"));

        MessageReaction mr = MessageReaction.builder()
                .message(message)
                .user(user)
                .reaction(reaction)
                .reactedAt(LocalDateTime.now())
                .build();
        try {
            reactionRepository.save(mr);
        } catch (DataIntegrityViolationException e) {
            // duplicate reaction, ignore
        }

        broadcastReactionUpdate(messageId, reaction, "added", user, conversationId);
    }

    @Transactional
    public void removeReaction(Long messageId, Long userId, String reaction, Long conversationId) {
        reactionRepository.deleteByMessageIdAndUserIdAndReaction(messageId, userId, reaction);

        User user = userRepository.findById(userId).orElse(null);
        broadcastReactionUpdate(messageId, reaction, "removed", user, conversationId);
    }

    private void broadcastReactionUpdate(Long messageId, String reaction, String action, User user, Long conversationId) {
        List<MessageReaction> reactions = reactionRepository.findByMessageId(messageId);

        List<MessageReactionResponse> mapped = reactions.stream()
                .map(r -> MessageReactionResponse.builder()
                        .userId(r.getUser().getId())
                        .userName(r.getUser().getUsername())
                        .userAvatar(r.getUser().getProfile() != null ? r.getUser().getProfile().getAvatarUrl() : null)
                        .reaction(r.getReaction())
                        .reactedAt(r.getReactedAt())
                        .build())
                .collect(Collectors.toList());

        Map<String, Long> byType = mapped.stream().collect(Collectors.groupingBy(MessageReactionResponse::getReaction, Collectors.counting()));

        com.example.zalocloneserver.dto.res.message.ReactionSummary summary = com.example.zalocloneserver.dto.res.message.ReactionSummary.builder()
                .totalCount(mapped.size())
                .byType(byType)
                .recentByUsers(new HashSet<>(mapped.stream().limit(5).collect(Collectors.toSet())))
                .build();

        Map<String, Object> payload = new HashMap<>();
        payload.put("messageId", messageId);
        payload.put("conversationId", conversationId);
        payload.put("reaction", reaction);
        payload.put("action", action);
        payload.put("user", user == null ? null : Map.of("id", user.getId(), "username", user.getUsername(), "avatar", user.getProfile() != null ? user.getProfile().getAvatarUrl() : null));
        payload.put("summary", summary);

        messagingTemplate.convertAndSend("/topic/chat/" + conversationId, Map.of("type", "REACTION_UPDATE", "payload", payload));
    }
}
