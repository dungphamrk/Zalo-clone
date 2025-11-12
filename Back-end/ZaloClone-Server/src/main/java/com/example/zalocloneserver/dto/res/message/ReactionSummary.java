package com.example.zalocloneserver.dto.res.message;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;
import java.util.Set;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReactionSummary {
    private long totalCount;
    private Map<String, Long> byType; // reaction -> count
    private Set<MessageReactionResponse> recentByUsers; // recent react users
}

