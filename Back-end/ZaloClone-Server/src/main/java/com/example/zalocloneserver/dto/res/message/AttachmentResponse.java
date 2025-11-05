package com.example.zalocloneserver.dto.res.message;


import lombok.*;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AttachmentResponse {
    private Long id;
    private Long messageId;
    private Long ownerUserId;
    private String url;
    private String storageKey;
    private String mime;
    private Long size;
    private String thumbUrl;
    private String metadata;
    private LocalDateTime createdAt;
}