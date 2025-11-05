package com.example.zalocloneserver.dto.res.user;

import com.example.zalocloneserver.model.constants.Gender;
import com.example.zalocloneserver.model.constants.Presence;
import jakarta.validation.constraints.*;
import lombok.*;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateProfileRequest {

    @Size(max = 255)
    private String avatarUrl;

    @Size(max = 500)
    private String bio;

    @Past(message = "Birthday must be in the past")
    private LocalDateTime birthday;

    private Gender gender;

    @Size(max = 100)
    private String location;

    private Presence presence;
}