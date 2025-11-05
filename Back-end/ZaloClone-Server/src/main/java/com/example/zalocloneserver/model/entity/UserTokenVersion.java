package com.example.zalocloneserver.model.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "user_token_version")
@NoArgsConstructor
@Data
@AllArgsConstructor
public class UserTokenVersion {
    @Id
    private String username;
    private Integer tokenVersion;

}
