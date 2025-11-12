package com.example.zalocloneserver.model.entity;

import com.example.zalocloneserver.dto.res.message.MessageResponse;
import com.example.zalocloneserver.model.constants.MessageType;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "messages")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Message {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "conversationId")
    private Conversation conversation;

    @ManyToOne
    @JoinColumn(name = "senderId")
    private User sender;

    @Enumerated(EnumType.STRING)
    private MessageType type;

    private String content;
    private String metadata;
    private LocalDateTime createdAt;
    private LocalDateTime editedAt;
    private boolean deleted;

    @OneToMany(mappedBy = "message" )
    @Builder.Default
    private Set<Attachment> attachments = new HashSet<>();

    // Reply-to relationship: a message may reply to another message
    @ManyToOne
    @JoinColumn(name = "replyToId")
    private Message replyTo;
}