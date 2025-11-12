package com.example.zalocloneserver.dto.req.conversation;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Set;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateGroupRequest {
    private String title;
    private Set<Long> memberIds; // additional members (creator will be added automatically)
}

