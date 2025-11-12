package com.example.zalocloneserver.dto.req;

import com.example.zalocloneserver.model.constants.RelationshipStatus;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserListItemDto {
    private Long id;
    private String username;
    private String displayName;
    private String avatarUrl;
    private RelationshipStatus status;
}
