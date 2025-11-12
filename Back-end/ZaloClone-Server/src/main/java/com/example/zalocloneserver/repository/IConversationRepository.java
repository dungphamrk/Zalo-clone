package com.example.zalocloneserver.repository;


import com.example.zalocloneserver.model.constants.ConversationType;
import com.example.zalocloneserver.model.entity.Conversation;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface IConversationRepository extends JpaRepository<Conversation, Long> {
    // Tìm đoạn chat cá nhân dựa trên unique key (title)
    Optional<Conversation> findByTypeAndTitle(ConversationType type, String title);
    // Tìm tất cả đoạn chat mà người dùng là thành viên
    // Cần Custom Query hoặc dùng ConversationMemberRepository
}