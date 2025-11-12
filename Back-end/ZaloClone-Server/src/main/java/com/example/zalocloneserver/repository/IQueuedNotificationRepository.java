package com.example.zalocloneserver.repository;

import com.example.zalocloneserver.model.entity.QueuedNotification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface IQueuedNotificationRepository extends JpaRepository<QueuedNotification, Long> {
    List<QueuedNotification> findByUsernameAndDeliveredAtIsNullOrderByCreatedAtAsc(String username);
}

