package com.example.zalocloneserver.model.entity;

import com.example.zalocloneserver.model.constants.CallType;
import com.example.zalocloneserver.model.constants.CallStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "calls")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Call {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "conversationId")
    private Conversation conversation;

    @Enumerated(EnumType.STRING)
    private CallType callType;

    @ManyToOne
    @JoinColumn(name = "initiatorId")
    private User initiator;

    private LocalDateTime startedAt;
    private LocalDateTime endedAt;

    @Enumerated(EnumType.STRING)
    private CallStatus status;

    private String metadata;
}