package com.example.zalocloneserver.services;

public interface IReactionService {
    void addReaction(Long messageId, Long userId, String reaction, Long conversationId);
    void removeReaction(Long messageId, Long userId, String reaction, Long conversationId);
}

