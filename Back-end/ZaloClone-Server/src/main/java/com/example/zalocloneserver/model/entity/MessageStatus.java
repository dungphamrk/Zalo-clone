package com.example.zalocloneserver.model.entity;

import com.example.zalocloneserver.model.constants.DeliveryStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "message_statuses",
        uniqueConstraints = @UniqueConstraint(columnNames = {"messageId", "userId"}))
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MessageStatus {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "messageId")
    private Message message;

    @ManyToOne
    @JoinColumn(name = "userId")
    private User user;

    @Enumerated(EnumType.STRING)
    private DeliveryStatus status;

    private LocalDateTime updatedAt;
}   