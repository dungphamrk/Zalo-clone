package com.example.zalocloneserver.dto.res.base;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.http.HttpStatus;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class APIResponse<T> {
    private Boolean success;
    private String message;
    private HttpStatus statusCode;
    private DataResponse<T> data;
    private List<ErrorDetail> errors; // Đổi thành List

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime timestamp = LocalDateTime.now();

    // ==================== SUCCESS ====================

    public static <T> APIResponse<T> success(T data, String message, HttpStatus status) {
        APIResponse<T> response = new APIResponse<>();
        response.setSuccess(true);
        response.setMessage(message);
        response.setStatusCode(status);
        response.setData(data != null ? new DataResponse<>(data, null) : null);
        response.setErrors(null);
        return response;
    }

    public static <T> APIResponse<T> success(T data, String message) {
        return success(data, message, HttpStatus.OK);
    }

    public static <T> APIResponse<T> success(T data) {
        return success(data, "Success", HttpStatus.OK);
    }

    // ==================== ERROR ====================

    public static <T> APIResponse<T> error(String message, List<ErrorDetail> errors, HttpStatus status) {
        APIResponse<T> response = new APIResponse<>();
        response.setSuccess(false);
        response.setMessage(message);
        response.setStatusCode(status);
        response.setData(null);
        response.setErrors(errors != null ? errors : Collections.emptyList());
        return response;
    }

    public static <T> APIResponse<T> error(String message, ErrorDetail error, HttpStatus status) {
        return error(message, error != null ? List.of(error) : Collections.emptyList(), status);
    }

    public static <T> APIResponse<T> error(String message, HttpStatus status) {
        return error(message, Collections.emptyList(), status);
    }
}