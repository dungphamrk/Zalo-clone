package com.example.zalocloneserver.services.impl;

import com.example.zalocloneserver.dto.req.auth.FormLogin;
import com.example.zalocloneserver.dto.req.auth.JwtResponse;
import com.example.zalocloneserver.services.IAuthService;

public class AuthService implements IAuthService {
    @Override
    public JwtResponse login(FormLogin formLogin) {
        return null;
    }

    @Override
    public Object logout() {
        return null;
    }
}
