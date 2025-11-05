package com.example.zalocloneserver.model.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "phone_contacts")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PhoneContact {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "ownerUserId")
    private User owner;

    private String contactName;
    private String contactPhone;
    private String normalizedPhone;
    private LocalDateTime importedAt;
}