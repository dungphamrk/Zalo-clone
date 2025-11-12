package com.example.zalocloneserver.repository;

import com.example.zalocloneserver.model.entity.Story;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface IStoryRepository extends JpaRepository<Story, Long> {
    // Get active stories that haven't expired
    @Query("SELECT s FROM Story s WHERE s.isActive = true AND s.expiresAt > :now ORDER BY s.createdAt DESC")
    List<Story> findActiveStories(@Param("now") LocalDateTime now);
    
    // Get stories by user
    List<Story> findByUser_IdAndIsActiveTrue(Long userId);
}

