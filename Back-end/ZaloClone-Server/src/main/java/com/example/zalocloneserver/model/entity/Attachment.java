package com.example.zalocloneserver.model.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "attachments")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Attachment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "messageId")
    private Message message;

    @ManyToOne
    @JoinColumn(name = "ownerUserId")
    private User owner;

    private String url;
    private String storageKey;
    private String mime;
    private Long size;
    private String thumbUrl;
    private String metadata;
    private LocalDateTime createdAt;
}