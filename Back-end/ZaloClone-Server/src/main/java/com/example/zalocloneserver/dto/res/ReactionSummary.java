package com.example.zalocloneserver.dto.res;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ReactionSummary {
    private Long count;
    private boolean reactedByMe;
}