package com.example.zalocloneserver.model.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "queued_notifications")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QueuedNotification {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String username;
    private String destination;

    @Lob
    private String payloadJson;

    private LocalDateTime createdAt;
    private LocalDateTime deliveredAt;
    private int attempts;
}

