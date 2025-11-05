package com.example.zalocloneserver.model.entity;

import com.example.zalocloneserver.model.constants.GroupType;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "groups")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Group {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "conversationId")
    private Conversation conversation;

    @Enumerated(EnumType.STRING)
    private GroupType groupType;

    private String inviteToken;
    private LocalDateTime inviteExpiresAt;
}