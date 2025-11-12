package com.example.zalocloneserver.dto.res;

import com.example.zalocloneserver.model.constants.Gender;
import com.example.zalocloneserver.model.constants.Presence;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserSearchResponse {
    private Long id;
    private String username;
    private String displayName;
    private String avatarUrl;
    private Gender gender;
    private Presence presence;
    private String status; // "NEW", "PENDING", "FRIEND"
}
