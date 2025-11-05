package com.example.zalocloneserver.model.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "call_participants",
        uniqueConstraints = @UniqueConstraint(columnNames = {"callId", "userId"}))
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CallParticipant {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "callId")
    private Call call;

    @ManyToOne
    @JoinColumn(name = "userId")
    private User user;

    private LocalDateTime joinedAt;
    private LocalDateTime leftAt;
}