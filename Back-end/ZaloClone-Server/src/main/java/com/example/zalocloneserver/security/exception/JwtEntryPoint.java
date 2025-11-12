package com.example.zalocloneserver.security.exception;

import com.example.zalocloneserver.dto.res.base.APIResponse;
import com.example.zalocloneserver.dto.res.base.ErrorDetail;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.MalformedJwtException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.security.SignatureException;
import java.time.LocalDateTime;
import java.util.Collections;

@Slf4j
@Component
public class JwtEntryPoint implements AuthenticationEntryPoint
{
    private final ObjectMapper objectMapper;

    public JwtEntryPoint(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    @Override
    public void commence(HttpServletRequest request,
                         HttpServletResponse response,
                         AuthenticationException authException) throws IOException {

        log.error("Authentication failed: {}", authException.getMessage());
        String requestURL = request.getRequestURI();
        log.error("Authentication failed on URL: {}", requestURL);
        Exception jwtException = (Exception) request.getAttribute("jwt_exception");

        String message;
        String field = "token";
        if (jwtException instanceof ExpiredJwtException) {
            message = "JWT token has expired";
            log.warn("JWT Exception: Expired token");
        } else if (jwtException instanceof SignatureException) {
            message = "Invalid JWT signature";
            log.warn("JWT Exception: Invalid signature");
        } else if (jwtException instanceof MalformedJwtException) {
            message = "Malformed JWT token";
            log.warn("JWT Exception: Malformed token");
        } else if (jwtException != null) {
            message = jwtException.getMessage();
            log.error("JWT Exception (Other): {}", message);
        } else {
            message = "Unauthorized - Invalid or missing JWT token";
            log.error("Authentication Entry Point: Unauthorized access");
        }

        APIResponse<Object> apiResponse = new APIResponse<>(
                false,
                message,
                HttpStatus.UNAUTHORIZED,
                null,
                Collections.singletonList(new ErrorDetail(field, message)),
                LocalDateTime.now()
        );

        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);

        this.objectMapper.writeValue(response.getOutputStream(), apiResponse);
    }
}