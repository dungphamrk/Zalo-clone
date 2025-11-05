package com.example.zalocloneserver.model.entity;

import com.example.zalocloneserver.model.constants.MemberRole;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "conversation_members",
        uniqueConstraints = @UniqueConstraint(columnNames = {"conversationId", "userId"}))
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ConversationMember {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "conversationId")
    private Conversation conversation;

    @ManyToOne
    @JoinColumn(name = "userId")
    private User user;

    @Enumerated(EnumType.STRING)
    private MemberRole role;

    private LocalDateTime joinedAt;
    private LocalDateTime muteUntil;
}