package com.example.zalocloneserver.dto.req.message;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AttachmentUploadRequest {
    private String url;
    private String storageKey;
    private String mime;
    private Long size;
    private String thumbUrl;
    private String metadata;
}

