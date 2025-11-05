package com.example.zalocloneserver.dto.res.auth;


import com.example.zalocloneserver.model.constants.Role;
import jakarta.validation.constraints.*;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RegisterRequest {

    @NotBlank(message = "Phone is required")
    @Pattern(regexp = "^\\+?[0-9]{8,15}$", message = "Invalid phone format")
    private String phone;

    @Email(message = "Invalid email")
    private String email;

    @NotBlank(message = "Username is required")
    @Size(min = 3, max = 30, message = "Username must be 3-30 characters")
    private String username;

    @NotBlank(message = "Password is required")
    @Size(min = 6, message = "Password must be at least 6 characters")
    private String password;

    @NotBlank(message = "Display name is required")
    @Size(max = 50)
    private String displayName;

    private Role role = Role.USER; // default
}
