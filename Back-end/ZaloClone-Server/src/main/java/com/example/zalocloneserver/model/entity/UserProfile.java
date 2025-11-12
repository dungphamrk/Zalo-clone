package com.example.zalocloneserver.model.entity;

import com.example.zalocloneserver.model.constants.Gender;
import com.example.zalocloneserver.model.constants.Presence;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.Date;

@Entity
@Table(name = "user_profiles")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class UserProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Long id;

    @JoinColumn(name = "userId")
    @OneToOne(fetch = FetchType.LAZY)
    private User user;

    private String avatarUrl;
    private String displayName;
    private Date birthday;

    @Enumerated(EnumType.STRING)
    private Gender gender;

    private String location;
    private LocalDateTime lastActive;

    @Enumerated(EnumType.STRING)
    private Presence presence;
}