package com.example.zalocloneserver.controller;

import com.example.zalocloneserver.dto.req.message.ReactionAddRequest;
import com.example.zalocloneserver.services.impl.ReactionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/conversations")
@RequiredArgsConstructor
public class ReactionController {

    private final ReactionService reactionService;

    @PostMapping("/{conversationId}/messages/{messageId}/reactions")
    public ResponseEntity<?> addReaction(@PathVariable Long conversationId, @PathVariable Long messageId, @RequestBody ReactionAddRequest req, @RequestHeader("X-User-Id") Long userId) {
        // Note: For simplicity using X-User-Id header; in real app use SecurityContext principal
        reactionService.addReaction(messageId, userId, req.getReaction(), conversationId);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{conversationId}/messages/{messageId}/reactions")
    public ResponseEntity<?> removeReaction(@PathVariable Long conversationId, @PathVariable Long messageId, @RequestParam String reaction, @RequestHeader("X-User-Id") Long userId) {
        reactionService.removeReaction(messageId, userId, reaction, conversationId);
        return ResponseEntity.ok().build();
    }
}

