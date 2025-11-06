package com.example.zalocloneserver.services;

import com.example.zalocloneserver.dto.req.auth.FormLogin;
import com.example.zalocloneserver.dto.req.auth.JwtResponse;
import jakarta.validation.Valid;
import org.springframework.stereotype.Service;

@Service
public interface IAuthService {
    JwtResponse login(@Valid FormLogin formLogin);
    Object logout();
}
