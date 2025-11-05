package com.example.zalocloneserver.dto.req.auth;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class UserRequest {
    private String phone;
    @NotBlank(message = "Username cannot be empty")
    @Size(min = 4, max = 20, message = "Username must be between 4 and 20 characters")
    private String username;

    @NotBlank(message = "Password cannot be empty")
    @Size(min = 6, message = "Password must be at least 6 characters long")
    private String password;

    @NotBlank(message = "Full name cannot be empty")
    private String fullName;

    @Past(message = "Date of birth must be in the past")
    private Date dateOfBirth;

    @NotBlank(message = "Phone number cannot be empty")
    @Pattern(
            regexp = "^(0|\\+84)(\\d{9})$",
            message = "Phone number must follow the Vietnam format"
    )
    private Boolean status = true;

    @NotBlank(message = "Address cannot be empty")
    private String address;

    private String avatarUrl;
}