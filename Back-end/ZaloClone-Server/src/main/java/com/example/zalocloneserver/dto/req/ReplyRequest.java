package com.example.zalocloneserver.dto.req;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReplyRequest {
    @NotBlank(message = "Vui lòng nhập nội dung")
    @Size(max = 500, message = "Vui lòng không nhập quá 500 ký tự")
    private String content;
}

