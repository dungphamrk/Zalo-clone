package com.example.zalocloneserver.dto.req.message;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReactionAddRequest {
    private String reaction; // e.g. like, love
}

