package com.example.zalocloneserver.model.entity;

import com.example.zalocloneserver.model.constants.ConversationType;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "conversations")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Conversation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    private ConversationType type;

    private String title;
    private String avatarUrl;

    @ManyToOne
    @JoinColumn(name = "createdBy")
    private User creator;

    private LocalDateTime createdAt;
    private LocalDateTime lastMessageAt;
    private boolean isPublic;

    @OneToMany(mappedBy = "conversation", cascade = CascadeType.ALL)
    @Builder.Default
    private Set<ConversationMember> members = new HashSet<>();

    @OneToMany(mappedBy = "conversation", cascade = CascadeType.ALL)
    @Builder.Default
    private Set<Message> messages = new HashSet<>();
}