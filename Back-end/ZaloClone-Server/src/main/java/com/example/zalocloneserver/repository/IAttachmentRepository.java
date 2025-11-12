package com.example.zalocloneserver.repository;

import com.example.zalocloneserver.model.entity.Attachment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface IAttachmentRepository extends JpaRepository<Attachment, Long> {
    List<Attachment> findByMessageId(Long messageId);

    // Batch fetch
    List<Attachment> findByMessageIdIn(List<Long> messageIds);
}
