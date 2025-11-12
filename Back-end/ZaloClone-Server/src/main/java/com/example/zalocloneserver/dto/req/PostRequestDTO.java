package com.example.zalocloneserver.dto.req;

import com.example.zalocloneserver.model.constants.Visibility;
import lombok.*;

import jakarta.validation.constraints.Size;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PostRequestDTO {

    @Size(max = 500, message = "Nội dung không được quá 500 từ")
    private String content;

    private Visibility visibility = Visibility.PUBLIC; // Mặc định là PUBLIC

    private List<String> mediaUrls; // URLs từ Cloudinary (không bắt buộc, có thể null hoặc empty)
}
