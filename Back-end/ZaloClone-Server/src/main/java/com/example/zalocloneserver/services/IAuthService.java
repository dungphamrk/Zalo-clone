package com.example.zalocloneserver.services;

import com.example.zalocloneserver.dto.req.auth.FormLogin;
import com.example.zalocloneserver.dto.req.auth.JwtResponse;
import org.springframework.stereotype.Service;

@Service
public interface IAuthService {
    JwtResponse login(FormLogin formLogin);
    Object logout();
}
