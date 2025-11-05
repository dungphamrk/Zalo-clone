package com.example.zalocloneserver.dto.req.post;

import com.example.zalocloneserver.model.constants.Visibility;
import jakarta.validation.constraints.*;
import lombok.*;
import java.util.Set;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdatePostRequest {

    @Size(max = 10000)
    private String content;

    private Visibility visibility;
    private Boolean allowComments;
    private Boolean pinned;

    @Size(max = 10)
    private Set<String> tags;
}