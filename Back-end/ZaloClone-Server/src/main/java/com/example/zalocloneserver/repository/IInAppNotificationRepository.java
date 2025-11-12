package com.example.zalocloneserver.repository;

import com.example.zalocloneserver.model.entity.InAppNotification;
import com.example.zalocloneserver.model.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

public interface IInAppNotificationRepository extends JpaRepository<InAppNotification, Long> {

    Page<InAppNotification> findByUserOrderByCreatedAtDesc(User user, Pageable pageable);

    long countByUserAndSeen(User user, boolean seen);
    
    long countByUser(User user);

    @Transactional
    @Modifying
    @Query("UPDATE InAppNotification n SET n.seen = true WHERE n.user = :user AND n.seen = false")
    void markAllAsSeenForUser(User user);
    
    @Transactional
    @Modifying
    @Query("DELETE FROM InAppNotification n WHERE n.user = :user AND n.type = :type AND n.referenceId IN :messageIds")
    void deleteByUserAndTypeAndReferenceIds(@Param("user") User user, @Param("type") com.example.zalocloneserver.model.constants.NotificationType type, @Param("messageIds") List<String> messageIds);
    
    @Modifying
    @Transactional
    @Query("DELETE FROM InAppNotification n WHERE n.user = :user")
    void deleteAllByUser(@Param("user") User user);
}

