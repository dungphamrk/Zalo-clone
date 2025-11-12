package com.example.zalocloneserver.controller;
import com.example.zalocloneserver.dto.req.auth.FormLogin;
import com.example.zalocloneserver.dto.req.auth.RefreshTokenRequest;
import com.example.zalocloneserver.dto.req.auth.UserRequest;
import com.example.zalocloneserver.dto.res.auth.RefreshTokenResponse;
import com.example.zalocloneserver.dto.res.base.APIResponse;
import com.example.zalocloneserver.dto.res.user.UserResponse;
import com.example.zalocloneserver.services.IAuthService;
import com.example.zalocloneserver.services.IUserService;
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

    @Autowired
    private IUserService userService;

    @PostMapping("/login")
    @Operation(summary = "Đăng nhập", description = "Đăng nhập với username và mật khẩu")
    public ResponseEntity<APIResponse<Object>> handleLogin(@Valid @RequestBody FormLogin formLogin) {
        Object loginResult = authService.login(formLogin);
        return ResponseEntity.ok(APIResponse.success(loginResult, "Login successful"));
    }
    
    @PostMapping("/refresh")
    @Operation(summary = "Refresh token", description = "Làm mới access token bằng refresh token")
    public ResponseEntity<APIResponse<RefreshTokenResponse>> handleRefresh(@Valid @RequestBody RefreshTokenRequest request) {
        RefreshTokenResponse refreshResult = authService.refreshToken(request);
        return ResponseEntity.ok(APIResponse.success(refreshResult, "Token refreshed successfully"));
    }
    
    @PostMapping("/logout")
    @Operation(summary = "Đăng xuất", description = "Đăng xuất khỏi hệ thống")
    public ResponseEntity<APIResponse<Object>> handleLogout() {
        Object result = authService.logout();
        return ResponseEntity.ok(APIResponse.success(result, "Logout successful"));
    }
    
    @PostMapping("/register")
    public ResponseEntity<APIResponse<UserResponse>> createUser(@Valid @RequestBody UserRequest userRequest) {
        UserResponse createdUser = userService.createUser(userRequest);
        return ResponseEntity.ok(APIResponse.success(createdUser, "Account created successfully"));
    }

}

