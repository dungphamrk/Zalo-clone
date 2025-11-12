package com.example.zalocloneserver.repository;

import com.example.zalocloneserver.model.entity.Conversation;
import com.example.zalocloneserver.model.entity.Message;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface IMessageRepository extends JpaRepository<Message, Long> {

    // Lấy lịch sử tin nhắn của một Conversation
    List<Message> findByConversationOrderByCreatedAtAsc(Conversation conversation);

    // Paging support
    Page<Message> findByConversation(Conversation conversation, Pageable pageable);
}