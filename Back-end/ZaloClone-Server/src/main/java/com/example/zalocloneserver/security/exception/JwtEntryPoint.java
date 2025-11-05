package com.example.zalocloneserver.security.exception;


import com.example.zalocloneserver.dto.res.base.APIResponse;
import com.example.zalocloneserver.dto.res.base.ErrorDetail;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.MalformedJwtException;
import jakarta.servlet.ServletException;
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
import java.util.HashMap;
import java.util.Map;

@Slf4j
@Component
public class JwtEntryPoint implements AuthenticationEntryPoint
{
    @Override
    public void commence(HttpServletRequest request,
                         HttpServletResponse response,
                         AuthenticationException authException) throws IOException {

        Exception jwtException = (Exception) request.getAttribute("jwt_exception");

        String message;
        String field = "token";

        if (jwtException instanceof ExpiredJwtException) {
            message = "JWT token has expired";
        } else if (jwtException instanceof SignatureException) {
            message = "Invalid JWT signature";
        } else if (jwtException instanceof MalformedJwtException) {
            message = "Malformed JWT token";
        } else if (jwtException != null) {
            message = jwtException.getMessage();
        } else {
            message = "Unauthorized - Invalid or missing JWT token";
        }

        APIResponse<Object> apiResponse = new APIResponse<>(
                false,
                message,
                HttpStatus.UNAUTHORIZED,
                null,
                Collections.singletonList(new ErrorDetail(field, message)),
                LocalDateTime.now()
        );

        response.setContentType("application/json");
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        new ObjectMapper().writeValue(response.getOutputStream(), apiResponse);
    }
}
