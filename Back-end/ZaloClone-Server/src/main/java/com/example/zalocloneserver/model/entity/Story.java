package com.example.zalocloneserver.model.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "stories")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Story {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    private String mediaUrl;
    private String mediaType; // "image" or "video"
    
    private LocalDateTime createdAt;
    private LocalDateTime expiresAt; // Stories expire after 24 hours
    
    private boolean isActive;
}

