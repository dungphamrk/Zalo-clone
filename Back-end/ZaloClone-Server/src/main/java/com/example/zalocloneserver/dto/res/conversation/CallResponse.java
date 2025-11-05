package com.example.zalocloneserver.dto.res.conversation;

import com.example.zalocloneserver.model.constants.CallStatus;
import com.example.zalocloneserver.model.constants.CallType;
import lombok.*;

import java.time.LocalDateTime;
import java.util.Set;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CallResponse {
    private Long id;
    private Long conversationId;
    private CallType callType;
    private Long initiatorId;
    private String initiatorName;
    private LocalDateTime startedAt;
    private LocalDateTime endedAt;
    private CallStatus status;
    private String metadata;
    private Set<CallParticipantResponse> participants;
}