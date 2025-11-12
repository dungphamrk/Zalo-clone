package com.example.zalocloneserver.services;

import com.example.zalocloneserver.dto.req.message.MessageRequest;
import com.example.zalocloneserver.dto.res.message.MessageResponse;
import com.example.zalocloneserver.model.entity.Message;
import com.example.zalocloneserver.model.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface IMessageService {
    Message saveAndBroadcast(Long conversationId, User sender, MessageRequest request);

    // Lấy messages theo trang cho 1 conversation
    Page<MessageResponse> getMessagesForConversation(Long conversationId, Pageable pageable);

    // Lấy một message trong conversation (kiểm tra thuộc conversation)
    MessageResponse getMessageForConversation(Long conversationId, Long messageId);
}
