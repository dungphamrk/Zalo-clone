package com.example.zalocloneserver.model.entity;

import com.example.zalocloneserver.model.constants.Gender;
import com.example.zalocloneserver.model.constants.Presence;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "user_profiles")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "userId")
    private User user;

    private String avatarUrl;
    private String bio;
    private LocalDateTime birthday;

    @Enumerated(EnumType.STRING)
    private Gender gender;

    private String location;
    private LocalDateTime lastActive;

    @Enumerated(EnumType.STRING)
    private Presence presence;
}