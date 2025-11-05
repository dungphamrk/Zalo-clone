package com.example.zalocloneserver.controller;
import com.example.zalocloneserver.dto.req.auth.FormLogin;
import com.example.zalocloneserver.dto.res.base.APIResponse;
import com.example.zalocloneserver.services.IAuthService;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {
    @Autowired
    private  IAuthService authService;

    @PostMapping("/login")
    @Operation(summary = "Đăng nhập", description = "Đăng nhập với username và mật khẩu")
    public ResponseEntity<APIResponse<Object>> handleLogin(@Valid @RequestBody FormLogin formLogin) {
        Object loginResult = authService.login(formLogin);
        return ResponseEntity.ok(APIResponse.success(loginResult, "Login successful"));
    }
    @PostMapping("/logout")
    @Operation(summary = "Đăng xuất", description = "Đăng xuất khỏi hệ thống")
    public ResponseEntity<APIResponse<Object>> handleLogout() {
        Object result = authService.logout();
        return ResponseEntity.ok(APIResponse.success(result, "Logout successful"));
    }
}

