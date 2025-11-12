package com.example.zalocloneserver.repository;

import com.example.zalocloneserver.model.entity.Conversation;
import com.example.zalocloneserver.model.entity.Message;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDateTime;
import java.util.List;

public interface IMessageRepository extends JpaRepository<Message, Long> {

    // Lấy lịch sử tin nhắn của một Conversation
    List<Message> findByConversationOrderByCreatedAtAsc(Conversation conversation);

    // Paging support
    Page<Message> findByConversation(Conversation conversation, Pageable pageable);
    
    // Lấy tin nhắn cuối cùng của một Conversation
    Message findTopByConversationOrderByCreatedAtDesc(Conversation conversation);
    
    // Đếm số tin nhắn sau một thời điểm cụ thể
    @Query("SELECT COUNT(m) FROM Message m WHERE m.conversation = :conversation AND m.createdAt > :after AND m.deleted = false")
    long countByConversationAndCreatedAtAfterAndDeletedFalse(@Param("conversation") Conversation conversation, @Param("after") LocalDateTime after);
    
    // Đếm tất cả tin nhắn chưa xóa trong conversation
    @Query("SELECT COUNT(m) FROM Message m WHERE m.conversation = :conversation AND m.deleted = false")
    long countByConversationAndDeletedFalse(@Param("conversation") Conversation conversation);
}