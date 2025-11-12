package com.example.zalocloneserver.services.impl;

import com.example.zalocloneserver.model.constants.ConversationType;
import com.example.zalocloneserver.model.constants.MemberRole;
import com.example.zalocloneserver.model.entity.Conversation;
import com.example.zalocloneserver.model.entity.ConversationMember;
import com.example.zalocloneserver.model.entity.User;
import com.example.zalocloneserver.repository.IConversationMemberRepository;
import com.example.zalocloneserver.repository.IConversationRepository;
import com.example.zalocloneserver.services.IConversationService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class ConversationService implements IConversationService {

    private final IConversationRepository conversationRepository;
    private final IConversationMemberRepository memberRepository;

    private String createPrivateChatUniqueKey(Long id1, Long id2) {
        return (id1 < id2) ? id1 + "_" + id2 : id2 + "_" + id1;
    }

    /**
     * Tìm hoặc tạo cuộc trò chuyện 1-1 giữa hai người dùng.
     */
    @Transactional
    public Conversation getOrCreatePrivateConversation(User user1, User user2) {
        if (user1.getId().equals(user2.getId())) {
            throw new IllegalArgumentException("Cannot create private chat with self.");
        }

        String uniqueKey = createPrivateChatUniqueKey(user1.getId(), user2.getId());

        // 1. Tìm kiếm
        Optional<Conversation> existing = conversationRepository.findByTypeAndTitle(ConversationType.PRIVATE, uniqueKey);
        if (existing.isPresent()) {
            return existing.get();
        }

        // 2. Tạo mới
        Conversation newConversation = Conversation.builder()
                .type(ConversationType.PRIVATE)
                .title(uniqueKey)
                .creator(user1)
                .createdAt(LocalDateTime.now())
                .isPublic(false)
                .build();

        newConversation = conversationRepository.save(newConversation);

        // 3. Thêm thành viên
        addMemberToConversation(newConversation, user1, MemberRole.MEMBER);
        addMemberToConversation(newConversation, user2, MemberRole.MEMBER);

        return newConversation;
    }

    @Transactional
    public Conversation createGroupConversation(User creator, String title, Set<User> initialMembers) {

        Conversation groupConversation = Conversation.builder()
                .type(ConversationType.GROUP)
                .title(title)
                .creator(creator)
                .createdAt(LocalDateTime.now())
                .isPublic(false)
                .build();

        groupConversation = conversationRepository.save(groupConversation);

        addMemberToConversation(groupConversation, creator, MemberRole.ADMIN);
        Conversation finalGroupConversation = groupConversation;
        initialMembers.stream()
                .filter(u -> !u.getId().equals(creator.getId()))
                .forEach(u -> addMemberToConversation(finalGroupConversation, u, MemberRole.MEMBER));

        return groupConversation;
    }

    @Transactional
    public ConversationMember addMemberToConversation(Conversation conversation, User user, MemberRole role) {
        if (memberRepository.existsByConversationAndUser(conversation, user)) {
            return null;
        }

        ConversationMember member = ConversationMember.builder()
                .conversation(conversation)
                .user(user)
                .role(role)
                .build();

        return memberRepository.save(member);
    }

    public List<Conversation> getConversationsByUser(User user) {
        List<ConversationMember> members = memberRepository.findByUser(user);
        return members.stream()
                .map(ConversationMember::getConversation)
                .sorted((c1, c2) -> {
                    // Sort by lastMessageAt descending (most recent first)
                    LocalDateTime time1 = c1.getLastMessageAt() != null ? c1.getLastMessageAt() : c1.getCreatedAt();
                    LocalDateTime time2 = c2.getLastMessageAt() != null ? c2.getLastMessageAt() : c2.getCreatedAt();
                    if (time1 == null && time2 == null) return 0;
                    if (time1 == null) return 1;
                    if (time2 == null) return -1;
                    return time2.compareTo(time1);
                })
                .toList();
    }

    public Conversation getConversationById(Long conversationId, User requester) {
        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new RuntimeException("Conversation not found"));
        
        // Check if requester is a member
        boolean isMember = conversation.getMembers().stream()
                .anyMatch(m -> m.getUser().getId().equals(requester.getId()));
        
        if (!isMember) {
            throw new SecurityException("You are not a member of this conversation");
        }
        
        return conversation;
    }
}