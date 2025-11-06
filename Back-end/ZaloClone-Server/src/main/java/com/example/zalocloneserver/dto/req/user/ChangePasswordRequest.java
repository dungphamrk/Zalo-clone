package com.example.zalocloneserver.dto.req.user;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ChangePasswordRequest {
    @NotBlank(message = "Old password cannot be blank")
    private String oldPassword;

    @NotBlank(message = "New password cannot be blank")
    private String newPassword;

    @NotBlank(message = "Confirm new password cannot be blank")
    private String confirmPassword;
}