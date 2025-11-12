package com.example.zalocloneserver.dto.req.post;

import com.example.zalocloneserver.model.constants.PostType;
import com.example.zalocloneserver.model.constants.Visibility;
import jakarta.validation.constraints.*;
import lombok.*;
import java.util.Set;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PostRequest {

    @NotNull @Positive
    private Long userId;

    @NotNull
    private PostType type;

    @Size(max = 10000, message = "Content too long")
    private String content;

    @Size(max = 2000)
    private String metadata;

    @NotNull
    private Visibility visibility;

    private boolean allowComments;
    private boolean pinned;

    @Size(max = 10)
    private Set<String> tags;

//    @Size(max = 10)
//    private Set<AttachmentUploadRequest> attachments;
}