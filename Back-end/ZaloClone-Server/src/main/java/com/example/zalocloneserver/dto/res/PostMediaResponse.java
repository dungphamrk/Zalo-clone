package com.example.zalocloneserver.dto.res;

import com.example.zalocloneserver.model.constants.MediaType;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PostMediaResponse {
    private Long id;
    private String url;
    private MediaType type;
}
