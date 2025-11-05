package com.example.zalocloneserver.model.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "conversation_settings",
        uniqueConstraints = @UniqueConstraint(columnNames = {"conversationId", "userId"}))
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ConversationSetting {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "conversationId")
    private Conversation conversation;

    @ManyToOne
    @JoinColumn(name = "userId")
    private User user;

    private boolean pinned;
    private LocalDateTime mutedUntil;
    private boolean archived;
    private String lastReadMessageId;
}