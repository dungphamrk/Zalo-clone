package com.example.zalocloneserver.dto.req.message;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReactionRequest {
    private Long messageId;
    private String reaction; // e.g. like, love, laugh
    private String action;   // "add" or "remove"

    // Explicit getters to help IDEs/static analyzers that may not process Lombok
    public Long getMessageId() { return this.messageId; }
    public String getReaction() { return this.reaction; }
    public String getAction() { return this.action; }

    // Explicit setters as well
    public void setMessageId(Long messageId) { this.messageId = messageId; }
    public void setReaction(String reaction) { this.reaction = reaction; }
    public void setAction(String action) { this.action = action; }
}
