package com.example.zalocloneserver.model.entity;

import com.example.zalocloneserver.model.constants.Role;
import com.example.zalocloneserver.model.constants.UserStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String email;
    private String username;
    private String password;

    @Enumerated(EnumType.STRING)
    private Role role;

    @Enumerated(EnumType.STRING)
    private UserStatus status;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @OneToOne(cascade = CascadeType.ALL ,  fetch = FetchType.LAZY)
    private UserProfile profile;
}