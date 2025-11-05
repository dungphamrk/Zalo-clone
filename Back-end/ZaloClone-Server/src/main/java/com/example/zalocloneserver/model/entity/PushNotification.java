package com.example.zalocloneserver.model.entity;

import com.example.zalocloneserver.model.constants.PushStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "push_notifications")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PushNotification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "userId")
    private User user;

    private String title;
    private String body;
    private String data;
    private LocalDateTime sentAt;

    @Enumerated(EnumType.STRING)
    private PushStatus status;

    private LocalDateTime createdAt;
}