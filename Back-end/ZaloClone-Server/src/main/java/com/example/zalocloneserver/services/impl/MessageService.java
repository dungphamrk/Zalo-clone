package com.example.zalocloneserver.services.impl;

import com.example.zalocloneserver.dto.req.message.MessageRequest;
import com.example.zalocloneserver.dto.req.message.AttachmentUploadRequest;
import com.example.zalocloneserver.dto.res.message.MessageResponse;
import com.example.zalocloneserver.dto.res.message.ReactionSummary;
import com.example.zalocloneserver.dto.res.message.MessageReactionResponse;
import com.example.zalocloneserver.dto.res.message.AttachmentResponse;
import com.example.zalocloneserver.model.constants.MessageType;
import com.example.zalocloneserver.model.constants.ConversationType;
import com.example.zalocloneserver.model.entity.Attachment;
import com.example.zalocloneserver.model.entity.Conversation;
import com.example.zalocloneserver.model.entity.ConversationMember;
import com.example.zalocloneserver.model.entity.Message;
import com.example.zalocloneserver.model.entity.User;
import com.example.zalocloneserver.repository.IAttachmentRepository;
import com.example.zalocloneserver.repository.IConversationRepository;
import com.example.zalocloneserver.repository.IMessageRepository;
import com.example.zalocloneserver.repository.IMessageReactionRepository;
import com.example.zalocloneserver.repository.IFriendRepository;
import com.example.zalocloneserver.services.IMessageService;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.messaging.simp.SimpMessageSendingOperations;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MessageService implements IMessageService {

    private static final Logger logger = LoggerFactory.getLogger(MessageService.class);

    private final IMessageRepository messageRepository;
    private final IConversationRepository conversationRepository;
    private final IMessageReactionRepository reactionRepository;
    private final IAttachmentRepository attachmentRepository;
    private final IFriendRepository friendRepository;
    private final SimpMessageSendingOperations messageTemplate; // Dùng để broadcast

    private static final int MAX_ATTACHMENTS = 10;
    private static final long MAX_ATTACHMENT_SIZE = 10L * 1024 * 1024; // 10 MB
    private static final Set<String> ALLOWED_MIMES = Set.of("image/jpeg", "image/png", "image/gif", "video/mp4", "application/pdf", "text/plain");

    @Transactional
    public Message saveAndBroadcast(Long conversationId, User sender, MessageRequest request) {

        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new EntityNotFoundException("Conversation not found with ID: " + conversationId));

        // Server-side attachments validation
        if (request.getAttachments() != null && !request.getAttachments().isEmpty()) {
            if (request.getAttachments().size() > MAX_ATTACHMENTS) {
                sendPrivateChatError(sender.getUsername(), "Too many attachments. Max: " + MAX_ATTACHMENTS);
                return null;
            }
            for (AttachmentUploadRequest a : request.getAttachments()) {
                if (a.getSize() != null && a.getSize() > MAX_ATTACHMENT_SIZE) {
                    sendPrivateChatError(sender.getUsername(), "Attachment too large. Max size: " + (MAX_ATTACHMENT_SIZE / (1024*1024)) + " MB");
                    return null;
                }
                if (a.getMime() != null && !ALLOWED_MIMES.contains(a.getMime())) {
                    sendPrivateChatError(sender.getUsername(), "Attachment mime type not allowed: " + a.getMime());
                    return null;
                }
            }
        }

        // If private conversation, ensure users are friends
        if (conversation.getType() == ConversationType.PRIVATE) {
            // find other member
            Long otherUserId = conversation.getMembers().stream()
                    .map(ConversationMember::getUser)
                    .map(User::getId)
                    .filter(id -> !Objects.equals(id, sender.getId()))
                    .findFirst().orElse(null);

            if (otherUserId == null) {
                logger.warn("Private conversation {} has no other participant", conversationId);
                // allow or deny? Deny
                sendPrivateChatError(sender.getUsername(), "Private conversation misconfigured");
                return null;
            }

            List<com.example.zalocloneserver.model.entity.Friend> rel = friendRepository.findAllBetweenUsers(sender.getId(), otherUserId);
            if (rel == null || rel.isEmpty()) {
                // Not friends - notify sender
                sendPrivateChatError(sender.getUsername(), "You must be friends to message this user");
                return null;
            }
        }

        Message replyTo = null;
        if (request.getReplyToMessageId() != null) {
            replyTo = messageRepository.findById(request.getReplyToMessageId()).orElse(null);
            // ensure replyTo belongs to the same conversation and is not deleted
            if (replyTo == null || replyTo.getConversation() == null || !Objects.equals(replyTo.getConversation().getId(), conversationId) || replyTo.isDeleted()) {
                logger.warn("Invalid replyToMessageId={} for conversationId={}", request.getReplyToMessageId(), conversationId);
                replyTo = null;
            }
        }

        // 1. Tạo và Lưu Message
        Message message = Message.builder()
                .conversation(conversation)
                .sender(sender)
                .type(request.getType() != null ? request.getType() : MessageType.TEXT)
                .content(request.getContent())
                .metadata(request.getMetadata())
                .createdAt(LocalDateTime.now())
                .deleted(false)
                .replyTo(replyTo)
                .build();

        message = messageRepository.save(message);

        // attachments: persist any attachments provided
        Set<AttachmentResponse> attachmentResponses = Collections.emptySet();
        if (request.getAttachments() != null && !request.getAttachments().isEmpty()) {
            List<Attachment> saved = new ArrayList<>();
            for (AttachmentUploadRequest a : request.getAttachments()) {
                Attachment at = Attachment.builder()
                        .message(message)
                        .owner(sender)
                        .url(a.getUrl())
                        .storageKey(a.getStorageKey())
                        .mime(a.getMime())
                        .size(a.getSize())
                        .thumbUrl(a.getThumbUrl())
                        .metadata(a.getMetadata())
                        .createdAt(LocalDateTime.now())
                        .build();
                saved.add(attachmentRepository.save(at));
            }

            Message finalMessage = message;
            attachmentResponses = saved.stream().map(at -> AttachmentResponse.builder()
                    .id(at.getId())
                    .messageId(finalMessage.getId())
                    .ownerUserId(at.getOwner() != null ? at.getOwner().getId() : null)
                    .url(at.getUrl())
                    .storageKey(at.getStorageKey())
                    .mime(at.getMime())
                    .size(at.getSize())
                    .thumbUrl(at.getThumbUrl())
                    .metadata(at.getMetadata())
                    .createdAt(at.getCreatedAt())
                    .build()).collect(Collectors.toSet());
        }

        // 2. Cập nhật lastMessageAt
        conversation.setLastMessageAt(message.getCreatedAt());
        conversationRepository.save(conversation);

        // 3. Broadcast qua WebSocket
        String topicDestination = "/topic/chat/" + conversationId;

        // Convert to DTO (avoid exposing entity)
        MessageResponse messageDTO = convertToDto(message);

        // attach attachments responses
        if (!attachmentResponses.isEmpty()) {
            messageDTO.setAttachments(attachmentResponses);
        }

        messageTemplate.convertAndSend(topicDestination, messageDTO);

        return message;
    }

    private void sendPrivateChatError(String username, String message) {
        try {
            messageTemplate.convertAndSendToUser(username, "/queue/errors", Map.of("type", "CHAT_ERROR", "message", message));
        } catch (Exception e) {
            logger.warn("Failed to send private chat error to {}: {}", username, e.getMessage());
        }
    }

    // Hàm chuyển đổi Entity sang DTO (Data Transfer Object)
    MessageResponse convertToDto(Message message) {
        if (message == null) return null;

        MessageResponse.MessageResponseBuilder builder = MessageResponse.builder()
                .id(message.getId())
                .conversationId(message.getConversation() != null ? message.getConversation().getId() : null)
                .senderId(message.getSender() != null ? message.getSender().getId() : null)
                .senderName(message.getSender() != null ? message.getSender().getUsername() : null)
                .senderAvatar(message.getSender() != null && message.getSender().getProfile() != null ? message.getSender().getProfile().getAvatarUrl() : null)
                .type(message.getType())
                .content(message.getContent())
                .metadata(message.getMetadata())
                .createdAt(message.getCreatedAt())
                .editedAt(message.getEditedAt())
                .deleted(message.isDeleted());

        // replyTo
        if (message.getReplyTo() != null) {
            Message rt = message.getReplyTo();
            MessageResponse replyDto = MessageResponse.builder()
                    .id(rt.getId())
                    .senderId(rt.getSender() != null ? rt.getSender().getId() : null)
                    .senderName(rt.getSender() != null ? rt.getSender().getUsername() : null)
                    .senderAvatar(rt.getSender() != null && rt.getSender().getProfile() != null ? rt.getSender().getProfile().getAvatarUrl() : null)
                    .content(rt.getContent() != null && rt.getContent().length() > 200 ? rt.getContent().substring(0,200) : rt.getContent())
                    .createdAt(rt.getCreatedAt())
                    .build();
            builder.replyToMessageId(String.valueOf(rt.getId()));
            builder.replyTo(replyDto);
        }

        // attachments: for now use empty sets to avoid N+1 and serialization issues
        builder.attachments(Collections.emptySet());

        // reactions: build reaction summary
        List<MessageReactionResponse> reactions = reactionRepository.findByMessageId(message.getId())
                .stream()
                .map(r -> MessageReactionResponse.builder()
                        .userId(r.getUser().getId())
                        .userName(r.getUser().getUsername())
                        .userAvatar(r.getUser().getProfile() != null ? r.getUser().getProfile().getAvatarUrl() : null)
                        .reaction(r.getReaction())
                        .reactedAt(r.getReactedAt())
                        .build())
                .toList();

        Map<String, Long> byType = reactions.stream()
                .collect(Collectors.groupingBy(MessageReactionResponse::getReaction, Collectors.counting()));

        ReactionSummary summary = ReactionSummary.builder()
                .totalCount(reactions.size())
                .byType(byType)
                .recentByUsers(new HashSet<>(reactions.stream().limit(5).collect(Collectors.toSet())))
                .build();

        builder.reactions(Collections.unmodifiableSet(new HashSet<>(reactions)));
        builder.statuses(Collections.emptySet());
        builder.reactionSummary(summary);

        return builder.build();
    }

    @Override
    public Page<MessageResponse> getMessagesForConversation(Long conversationId, Pageable pageable) {
        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new EntityNotFoundException("Conversation not found with ID: " + conversationId));

        Page<Message> page = messageRepository.findByConversation(conversation, pageable);

        return mapPageToDtoWithBatch(page);
    }

    // Batch map helper
    private Page<MessageResponse> mapPageToDtoWithBatch(Page<Message> page) {
        List<Long> messageIds = page.stream().map(Message::getId).collect(Collectors.toList());

        // Batch load reactions and attachments
        List<com.example.zalocloneserver.model.entity.MessageReaction> reactions = messageIds.isEmpty() ? Collections.emptyList() : reactionRepository.findByMessageIdIn(messageIds);
        List<Attachment> attachments = messageIds.isEmpty() ? Collections.emptyList() : attachmentRepository.findByMessageIdIn(messageIds);

        // group
        Map<Long, List<com.example.zalocloneserver.model.entity.MessageReaction>> reactionsByMessage = reactions.stream().collect(Collectors.groupingBy(r -> r.getMessage().getId()));
        Map<Long, List<Attachment>> attachmentsByMessage = attachments.stream().collect(Collectors.groupingBy(a -> a.getMessage().getId()));

        // Map each Message to MessageResponse using grouped data
        List<MessageResponse> content = page.stream().map(m -> {
            MessageResponse dto = convertToDto(m);

            // attach real attachments
            List<Attachment> atList = attachmentsByMessage.getOrDefault(m.getId(), Collections.emptyList());
            if (!atList.isEmpty()) {
                Set<com.example.zalocloneserver.dto.res.message.AttachmentResponse> atResponses = atList.stream().map(at -> com.example.zalocloneserver.dto.res.message.AttachmentResponse.builder()
                        .id(at.getId())
                        .messageId(at.getMessage() != null ? at.getMessage().getId() : null)
                        .ownerUserId(at.getOwner() != null ? at.getOwner().getId() : null)
                        .url(at.getUrl())
                        .storageKey(at.getStorageKey())
                        .mime(at.getMime())
                        .size(at.getSize())
                        .thumbUrl(at.getThumbUrl())
                        .metadata(at.getMetadata())
                        .createdAt(at.getCreatedAt())
                        .build()).collect(Collectors.toSet());
                dto.setAttachments(atResponses);
            }

            // attach reactions and reaction summary
            List<com.example.zalocloneserver.model.entity.MessageReaction> mrList = reactionsByMessage.getOrDefault(m.getId(), Collections.emptyList());
            if (!mrList.isEmpty()) {
                List<com.example.zalocloneserver.dto.res.message.MessageReactionResponse> mapped = mrList.stream().map(r -> com.example.zalocloneserver.dto.res.message.MessageReactionResponse.builder()
                        .userId(r.getUser().getId())
                        .userName(r.getUser().getUsername())
                        .userAvatar(r.getUser().getProfile() != null ? r.getUser().getProfile().getAvatarUrl() : null)
                        .reaction(r.getReaction())
                        .reactedAt(r.getReactedAt())
                        .build()).collect(Collectors.toList());

                Map<String, Long> byType = mapped.stream().collect(Collectors.groupingBy(com.example.zalocloneserver.dto.res.message.MessageReactionResponse::getReaction, Collectors.counting()));
                com.example.zalocloneserver.dto.res.message.ReactionSummary summary = com.example.zalocloneserver.dto.res.message.ReactionSummary.builder()
                        .totalCount(mapped.size())
                        .byType(byType)
                        .recentByUsers(new HashSet<>(mapped.stream().limit(5).collect(Collectors.toSet())))
                        .build();

                dto.setReactions(Collections.unmodifiableSet(new HashSet<>(mapped)));
                dto.setReactionSummary(summary);
            }

            return dto;
        }).collect(Collectors.toList());

        return new org.springframework.data.domain.PageImpl<>(content, page.getPageable(), page.getTotalElements());
    }

    @Override
    public MessageResponse getMessageForConversation(Long conversationId, Long messageId) {
        Message message = messageRepository.findById(messageId).orElseThrow(() -> new EntityNotFoundException("Message not found"));
        if (message.getConversation() == null || !Objects.equals(message.getConversation().getId(), conversationId)) {
            throw new EntityNotFoundException("Message does not belong to conversation");
        }

        // build dto
        MessageResponse dto = convertToDto(message);

        // attachments
        List<Attachment> atList = attachmentRepository.findByMessageId(message.getId());
        if (!atList.isEmpty()) {
            Set<com.example.zalocloneserver.dto.res.message.AttachmentResponse> atResponses = atList.stream().map(at -> com.example.zalocloneserver.dto.res.message.AttachmentResponse.builder()
                    .id(at.getId())
                    .messageId(at.getMessage() != null ? at.getMessage().getId() : null)
                    .ownerUserId(at.getOwner() != null ? at.getOwner().getId() : null)
                    .url(at.getUrl())
                    .storageKey(at.getStorageKey())
                    .mime(at.getMime())
                    .size(at.getSize())
                    .thumbUrl(at.getThumbUrl())
                    .metadata(at.getMetadata())
                    .createdAt(at.getCreatedAt())
                    .build()).collect(Collectors.toSet());
            dto.setAttachments(atResponses);
        }

        // reactions
        List<com.example.zalocloneserver.model.entity.MessageReaction> mrList = reactionRepository.findByMessageId(message.getId());
        if (!mrList.isEmpty()) {
            List<com.example.zalocloneserver.dto.res.message.MessageReactionResponse> mapped = mrList.stream().map(r -> com.example.zalocloneserver.dto.res.message.MessageReactionResponse.builder()
                    .userId(r.getUser().getId())
                    .userName(r.getUser().getUsername())
                    .userAvatar(r.getUser().getProfile() != null ? r.getUser().getProfile().getAvatarUrl() : null)
                    .reaction(r.getReaction())
                    .reactedAt(r.getReactedAt())
                    .build()).collect(Collectors.toList());

            Map<String, Long> byType = mapped.stream().collect(Collectors.groupingBy(com.example.zalocloneserver.dto.res.message.MessageReactionResponse::getReaction, Collectors.counting()));
            com.example.zalocloneserver.dto.res.message.ReactionSummary summary = com.example.zalocloneserver.dto.res.message.ReactionSummary.builder()
                    .totalCount(mapped.size())
                    .byType(byType)
                    .recentByUsers(new HashSet<>(mapped.stream().limit(5).collect(Collectors.toSet())))
                    .build();

            dto.setReactions(Collections.unmodifiableSet(new HashSet<>(mapped)));
            dto.setReactionSummary(summary);
        }

        return dto;
    }
}
