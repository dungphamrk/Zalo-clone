package com.example.zalocloneserver.dto.req.auth;

import com.example.zalocloneserver.model.entity.User;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;


@NoArgsConstructor
@Data
@Builder
@AllArgsConstructor
public class JwtResponse
{
    private String accessToken;
    private final String type = "Bearer";
    @JsonIgnoreProperties({"roles","password"})
    private User user;
    private String refreshToken;

}
