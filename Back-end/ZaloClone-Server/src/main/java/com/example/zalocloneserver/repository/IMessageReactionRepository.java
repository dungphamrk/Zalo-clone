package com.example.zalocloneserver.repository;

import com.example.zalocloneserver.model.entity.MessageReaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface IMessageReactionRepository extends JpaRepository<MessageReaction, Long> {
    List<MessageReaction> findByMessageId(Long messageId);
    Optional<MessageReaction> findByMessageIdAndUserIdAndReaction(Long messageId, Long userId, String reaction);
    void deleteByMessageIdAndUserIdAndReaction(Long messageId, Long userId, String reaction);
    long countByMessageId(Long messageId);
    List<MessageReaction> findByMessageIdIn(List<Long> messageIds);
}
