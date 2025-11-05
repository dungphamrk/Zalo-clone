package com.example.zalocloneserver.model.entity;

import com.example.zalocloneserver.model.constants.PostType;
import com.example.zalocloneserver.model.constants.Visibility;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "posts")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Post {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "userId")
    private User user;

    @Enumerated(EnumType.STRING)
    private PostType type;

    private String content;
    private String metadata;

    @Enumerated(EnumType.STRING)
    private Visibility visibility;

    private boolean allowComments;
    private boolean pinned;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @Builder.Default
    private Long commentCount = 0L;

    @Builder.Default
    private Long reactionCount = 0L;
}