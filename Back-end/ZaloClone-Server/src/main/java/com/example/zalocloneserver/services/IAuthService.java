package com.example.zalocloneserver.services;

import com.example.zalocloneserver.dto.req.auth.FormLogin;
import com.example.zalocloneserver.dto.req.auth.JwtResponse;
import com.example.zalocloneserver.dto.req.auth.RefreshTokenRequest;
import com.example.zalocloneserver.dto.res.auth.RefreshTokenResponse;
import jakarta.validation.Valid;
import org.springframework.stereotype.Service;

@Service
public interface IAuthService {
    JwtResponse login(@Valid FormLogin formLogin);
    Object logout();
    RefreshTokenResponse refreshToken(@Valid RefreshTokenRequest request);
}
