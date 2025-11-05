package com.example.zalocloneserver.dto.req.phone;
import jakarta.validation.constraints.*;
import lombok.*;

@Data
@Builder
public class PhoneContactDTO {
    @NotBlank
    @Size(max = 100)
    private String contactName;

    @NotBlank
    @Pattern(regexp = "^\\+?[0-9]{8,15}$", message = "Invalid phone format")
    private String contactPhone;
}