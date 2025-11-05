package com.example.zalocloneserver.dto.req.phone;

import jakarta.validation.constraints.*;
import lombok.*;
import java.util.Set;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PhoneContactSyncRequest {

    @NotNull @Positive
    private Long ownerUserId;

    @NotEmpty
    @Size(max = 1000, message = "Max 1000 contacts per sync")
    private Set<PhoneContactDTO> contacts;
}

