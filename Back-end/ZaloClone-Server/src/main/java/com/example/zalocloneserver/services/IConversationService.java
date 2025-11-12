package com.example.zalocloneserver.services;

import com.example.zalocloneserver.model.entity.Conversation;
import com.example.zalocloneserver.model.entity.ConversationMember;
import com.example.zalocloneserver.model.entity.User;
import com.example.zalocloneserver.model.constants.MemberRole;

import java.util.List;
import java.util.Set;

public interface IConversationService {
    Conversation getOrCreatePrivateConversation(User user1, User user2);
    Conversation createGroupConversation(User creator, String title, Set<User> initialMembers);
    ConversationMember addMemberToConversation(Conversation conversation, User user, MemberRole role);
    List<Conversation> getConversationsByUser(User user);
    Conversation getConversationById(Long conversationId, User requester);
}
