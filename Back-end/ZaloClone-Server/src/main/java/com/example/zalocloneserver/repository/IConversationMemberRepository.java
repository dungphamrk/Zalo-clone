package com.example.zalocloneserver.repository;
import com.example.zalocloneserver.model.entity.Conversation;
import com.example.zalocloneserver.model.entity.ConversationMember;
import com.example.zalocloneserver.model.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface IConversationMemberRepository extends JpaRepository<ConversationMember, Long> {

    // Kiểm tra xem user đã là thành viên của conversation chưa
    boolean existsByConversationAndUser(Conversation conversation, User user);

    boolean existsByConversation_IdAndUser_Id(Long conversationId, Long userId);
    
    // Lấy tất cả conversations mà user là thành viên
    List<ConversationMember> findByUser(User user);
    
    // Lấy conversation member theo conversation và user
    ConversationMember findByConversationAndUser(Conversation conversation, User user);
}