package com.example.zalocloneserver.controller;

import com.example.zalocloneserver.dto.req.conversation.AddMembersRequest;
import com.example.zalocloneserver.dto.req.conversation.CreateGroupRequest;
import com.example.zalocloneserver.dto.res.base.APIResponse;
import com.example.zalocloneserver.dto.res.conversation.ConversationMemberResponse;
import com.example.zalocloneserver.dto.res.conversation.ConversationResponse;
import com.example.zalocloneserver.dto.res.message.MessageResponse;
import com.example.zalocloneserver.model.constants.MemberRole;
import com.example.zalocloneserver.model.entity.Conversation;
import com.example.zalocloneserver.model.entity.ConversationMember;
import com.example.zalocloneserver.model.entity.User;
import com.example.zalocloneserver.repository.IConversationMemberRepository;
import com.example.zalocloneserver.repository.IConversationRepository;
import com.example.zalocloneserver.repository.IFriendRepository;
import com.example.zalocloneserver.repository.IMessageRepository;
import com.example.zalocloneserver.repository.IUserRepository;
import com.example.zalocloneserver.services.IConversationService;
import com.example.zalocloneserver.services.IMessageService;
import com.example.zalocloneserver.services.INotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/conversations")
@RequiredArgsConstructor
public class ConversationController {

    private final IConversationService conversationService;
    private final IMessageService messageService;
    private final INotificationService notificationService;
    private final IUserRepository userRepository;
    private final IFriendRepository friendRepository;
    private final IConversationRepository conversationRepository;
    private final IConversationMemberRepository conversationMemberRepository;
    private final IMessageRepository messageRepository;

    // Create a group conversation. Only friends of creator will be added from provided memberIds.
    @PostMapping("/group")
    public ResponseEntity<APIResponse<ConversationResponse>> createGroup(@RequestBody CreateGroupRequest req) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName();
        User creator = userRepository.findByUsername(username).orElseThrow(() -> new RuntimeException("User not found"));

        Set<User> members = req.getMemberIds() == null ? Set.of() : req.getMemberIds().stream()
                .map(id -> userRepository.findById(id).orElseThrow(() -> new RuntimeException("User not found: " + id)))
                // only include users who are friends with creator
                .filter(u -> !friendRepository.findAllBetweenUsers(creator.getId(), u.getId()).isEmpty())
                .collect(Collectors.toSet());

        Conversation conv = conversationService.createGroupConversation(creator, req.getTitle(), members);

        return ResponseEntity.ok(APIResponse.success(toConversationResponse(conv), "Group conversation created successfully"));
    }

    // Add members to an existing conversation. Requester must be member and admin/creator. Only friends can be added.
    @PostMapping("/{conversationId}/members")
    public ResponseEntity<?> addMembers(@PathVariable Long conversationId, @RequestBody AddMembersRequest req) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName();
        User requester = userRepository.findByUsername(username).orElseThrow(() -> new RuntimeException("User not found"));

        if (req.getMemberIds() == null || req.getMemberIds().isEmpty()) {
            return ResponseEntity.badRequest().body("memberIds required");
        }

        Conversation conv = conversationRepository.findById(conversationId).orElseThrow(() -> new RuntimeException("Conversation not found"));

        boolean isMember = conv.getMembers().stream().anyMatch(m -> m.getUser().getId().equals(requester.getId()));
        if (!isMember) return ResponseEntity.status(403).body("Only conversation members can add new members");

        boolean isAdminOrCreator = (conv.getCreator() != null && conv.getCreator().getId().equals(requester.getId())) ||
                conv.getMembers().stream().filter(m -> m.getUser().getId().equals(requester.getId())).anyMatch(m -> m.getRole() == MemberRole.ADMIN);
        if (!isAdminOrCreator) return ResponseEntity.status(403).body("Only conversation admin/creator can add members");

        Set<User> toAdd = req.getMemberIds().stream()
                .map(id -> userRepository.findById(id).orElseThrow(() -> new RuntimeException("User not found: " + id)))
                // only add if friend with requester
                .filter(u -> !friendRepository.findAllBetweenUsers(requester.getId(), u.getId()).isEmpty())
                .collect(Collectors.toSet());

        toAdd.forEach(u -> conversationService.addMemberToConversation(conv, u, MemberRole.MEMBER));

        return ResponseEntity.ok().build();
    }

    // Get all conversations for the current user
    @GetMapping
    public ResponseEntity<APIResponse<List<ConversationResponse>>> getConversations() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName();
        User requester = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<Conversation> conversations = conversationService.getConversationsByUser(requester);
        List<ConversationResponse> responses = conversations.stream()
                .map(this::toConversationResponse)
                .toList();

        return ResponseEntity.ok(APIResponse.success(responses, "Get conversations successfully"));
    }

    // Get conversation by ID
    @GetMapping("/{conversationId}")
    public ResponseEntity<APIResponse<ConversationResponse>> getConversation(@PathVariable Long conversationId) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName();
        User requester = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Conversation conv = conversationService.getConversationById(conversationId, requester);
        ConversationResponse resp = toConversationResponse(conv);
        return ResponseEntity.ok(APIResponse.success(resp, "Get conversation successfully"));
    }

    // Create or return a private conversation between authenticated user and otherUserId. They must be friends.
    @PostMapping("/private/{otherUserId}")
    public ResponseEntity<?> createOrGetPrivate(@PathVariable Long otherUserId) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName();
        User requester = userRepository.findByUsername(username).orElseThrow(() -> new RuntimeException("User not found"));

        if (Objects.equals(requester.getId(), otherUserId)) return ResponseEntity.badRequest().body("Cannot create private chat with yourself");

        User other = userRepository.findById(otherUserId).orElseThrow(() -> new RuntimeException("User not found"));

        boolean areFriends = !friendRepository.findAllBetweenUsers(requester.getId(), otherUserId).isEmpty();
        if (!areFriends) return ResponseEntity.status(403).body("You must be friends to start a private chat");

        Conversation conv = conversationService.getOrCreatePrivateConversation(requester, other);
        ConversationResponse resp = toConversationResponse(conv);
        return ResponseEntity.ok(APIResponse.success(resp, "Private conversation created or retrieved successfully"));
    }

    // Lấy messages (paging) của một conversation
    @GetMapping("/{conversationId}/messages")
    public ResponseEntity<?> getMessages(@PathVariable Long conversationId,
                                         @RequestParam(defaultValue = "0") int page,
                                         @RequestParam(defaultValue = "20") int size,
                                         @RequestParam(defaultValue = "createdAt,desc") String sort) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName();
        User requester = userRepository.findByUsername(username).orElseThrow(() -> new RuntimeException("User not found"));

        Conversation conv = conversationRepository.findById(conversationId).orElseThrow(() -> new RuntimeException("Conversation not found"));

        boolean isMember = conversationMemberRepository.existsByConversation_IdAndUser_Id(conv.getId(), requester.getId());
        if (!isMember) return ResponseEntity.status(403).body("Only conversation members can view messages");

        // validate page/size
        if (page < 0) return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("page must be >= 0");
        if (size <= 0 || size > 200) return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("size must be between 1 and 200");

        // parse sort param like "createdAt,desc"
        String[] parts = sort.split(",");
        Sort.Direction dir = parts.length > 1 && parts[1].equalsIgnoreCase("asc") ? Sort.Direction.ASC : Sort.Direction.DESC;
        String sortBy = parts.length > 0 ? parts[0] : "createdAt";

        Pageable pageable = PageRequest.of(page, size, Sort.by(dir, sortBy));

        Page<MessageResponse> messages = messageService.getMessagesForConversation(conversationId, pageable);

        return ResponseEntity.ok(APIResponse.success(messages, "Get messages successfully"));
    }

    // Lấy 1 message cụ thể trong conversation
    @GetMapping("/{conversationId}/messages/{messageId}")
    public ResponseEntity<?> getMessage(@PathVariable Long conversationId, @PathVariable Long messageId) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName();
        User requester = userRepository.findByUsername(username).orElseThrow(() -> new RuntimeException("User not found"));

        Conversation conv = conversationRepository.findById(conversationId).orElseThrow(() -> new RuntimeException("Conversation not found"));
        boolean isMember = conversationMemberRepository.existsByConversation_IdAndUser_Id(conv.getId(), requester.getId());
        if (!isMember) return ResponseEntity.status(403).body("Only conversation members can view messages");

        MessageResponse resp = messageService.getMessageForConversation(conversationId, messageId);
        return ResponseEntity.ok(resp);
    }

    // Đánh dấu conversation đã đọc
    @PostMapping("/{conversationId}/mark-as-read")
    public ResponseEntity<APIResponse<Map<String, Object>>> markAsRead(@PathVariable Long conversationId) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName();
        User requester = userRepository.findByUsername(username).orElseThrow(() -> new RuntimeException("User not found"));

        Conversation conv = conversationRepository.findById(conversationId).orElseThrow(() -> new RuntimeException("Conversation not found"));
        boolean isMember = conversationMemberRepository.existsByConversation_IdAndUser_Id(conv.getId(), requester.getId());
        if (!isMember) {
            return ResponseEntity.status(403).body(APIResponse.error("Only conversation members can mark as read", null));
        }

        ConversationMember member = conversationMemberRepository.findByConversationAndUser(conv, requester);
        if (member == null) {
            return ResponseEntity.status(404).body(APIResponse.error("Member not found", null));
        }

        // Cập nhật lastReadAt
        member.setLastReadAt(java.time.LocalDateTime.now());
        conversationMemberRepository.save(member);

        // Xóa các notification liên quan đến conversation này
        notificationService.deleteNotificationsByConversation(requester, conv);

        return ResponseEntity.ok(APIResponse.success(Map.of("conversationId", conversationId, "markedAt", member.getLastReadAt()), "Marked as read successfully"));
    }

    // --- helper ---
    private ConversationResponse toConversationResponse(Conversation conv) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth != null ? auth.getName() : null;
        User currentUser = username != null ? userRepository.findByUsername(username).orElse(null) : null;
        
        // Lấy tin nhắn cuối cùng
        com.example.zalocloneserver.model.entity.Message lastMsg = messageRepository.findTopByConversationOrderByCreatedAtDesc(conv);
        String lastMessageContent = null;
        Long lastMessageSenderId = null;
        String lastMessageSenderName = null;
        
        if (lastMsg != null && !lastMsg.isDeleted()) {
            lastMessageContent = lastMsg.getContent();
            if (lastMsg.getSender() != null) {
                lastMessageSenderId = lastMsg.getSender().getId();
                // Lấy displayName từ profile, fallback về username nếu không có
                if (lastMsg.getSender().getProfile() != null && lastMsg.getSender().getProfile().getDisplayName() != null) {
                    lastMessageSenderName = lastMsg.getSender().getProfile().getDisplayName();
                } else {
                    lastMessageSenderName = lastMsg.getSender().getUsername();
                }
            }
            // Nếu là tin nhắn có attachment, hiển thị "[Hình ảnh]" hoặc "[File]"
            if (lastMessageContent == null || lastMessageContent.trim().isEmpty()) {
                if (lastMsg.getAttachments() != null && !lastMsg.getAttachments().isEmpty()) {
                    lastMessageContent = "[Hình ảnh]";
                } else {
                    lastMessageContent = "[Tin nhắn]";
                }
            }
        }
        
        // Tính unreadCount: số tin nhắn sau lastReadAt của current user
        Long unreadCount = 0L;
        if (currentUser != null) {
            ConversationMember member = conversationMemberRepository.findByConversationAndUser(conv, currentUser);
            if (member != null && member.getLastReadAt() != null && lastMsg != null) {
                // Đếm số tin nhắn được tạo sau lastReadAt
                unreadCount = messageRepository.countByConversationAndCreatedAtAfterAndDeletedFalse(
                    conv, member.getLastReadAt());
            } else if (member != null && member.getLastReadAt() == null && lastMsg != null) {
                // Nếu chưa đọc lần nào, đếm tất cả tin nhắn
                unreadCount = messageRepository.countByConversationAndDeletedFalse(conv);
            }
        }
        
        ConversationResponse resp = ConversationResponse.builder()
                .id(conv.getId())
                .type(conv.getType())
                .title(conv.getTitle())
                .avatarUrl(conv.getAvatarUrl())
                .creatorId(conv.getCreator() != null ? conv.getCreator().getId() : null)
                .creatorName(conv.getCreator() != null && conv.getCreator().getProfile() != null ? conv.getCreator().getProfile().getDisplayName() : null)
                .createdAt(conv.getCreatedAt())
                .lastMessageAt(conv.getLastMessageAt())
                .lastMessage(lastMessageContent)
                .lastMessageSenderId(lastMessageSenderId)
                .lastMessageSenderName(lastMessageSenderName)
                .isPublic(conv.isPublic())
                .members(conv.getMembers().stream().map(this::toMemberResponse).collect(Collectors.toSet()))
                .unreadCount(unreadCount)
                .build();
        return resp;
    }

    private ConversationMemberResponse toMemberResponse(ConversationMember m) {
        return ConversationMemberResponse.builder()
                .userId(m.getUser().getId())
                .userName(m.getUser().getProfile() != null && m.getUser().getProfile().getDisplayName() != null 
                        ? m.getUser().getProfile().getDisplayName() 
                        : m.getUser().getUsername())
                .avatarUrl(m.getUser().getProfile() != null ? m.getUser().getProfile().getAvatarUrl() : null)
                .role(m.getRole())
                .joinedAt(m.getUser().getProfile() != null ? m.getUser().getProfile().getLastActive() : null)
                .muteUntil(m.getMuteUntil())
                .build();
    }
}
