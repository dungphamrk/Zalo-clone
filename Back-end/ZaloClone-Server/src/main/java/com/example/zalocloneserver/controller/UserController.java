package com.example.zalocloneserver.controller;

import com.example.zalocloneserver.dto.res.base.APIResponse;
import com.example.zalocloneserver.dto.res.user.UpdateProfileRequest;
import com.example.zalocloneserver.dto.res.user.UserProfileResponse;
import com.example.zalocloneserver.dto.res.user.UserResponse;
import com.example.zalocloneserver.model.entity.User;
import com.example.zalocloneserver.repository.IUserRepository;
import com.example.zalocloneserver.services.IUserService;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private IUserRepository userRepository;

    @Autowired
    private IUserService userService;

    @Operation(summary = "Tạo tài khoản người dùng", description = "Tạo mới một tài khoản người dùng")
    @PostMapping
    public ResponseEntity<APIResponse<User>> createUser(@Valid @RequestBody UserRequest userRequest) {
        User createdUser = userService.createUser(userRequest);
        return ResponseEntity.ok(APIResponse.success(createdUser, "Account created successfully"));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Tìm user theo ID", description = "Trả về thông tin user")
    public ResponseEntity<APIResponse<UserResponse>> getById(@PathVariable Long id) {
        UserResponse data = userService.findById(id);
        return ResponseEntity.ok(APIResponse.success(data, "Get user by id successfully"));
    }

    @PutMapping("/me")
    @Operation(summary = "Cập nhật thông tin cá nhân của người dùng hiện tại", description = "Cập nhật thông tin cá nhân của người dùng hiện tại")
    public ResponseEntity<UserProfileResponse> updateMyProfile(
            @RequestPart("user") UpdateProfileRequest request
    ) {
        return ResponseEntity.ok(userService.updateMyProfile(request));
    }

    @Operation(summary = "Đổi mật khẩu của người dùng hiện tại", description = "Đổi mật khẩu của người dùng hiện tại")
    public ResponseEntity<APIResponse<Void>> changePassword(@RequestBody @Valid ChangePasswordRequest request,
                                                            Principal principal) {
        User currentUser = userRepository.findByUsername(principal.getName())
                .orElseThrow(() -> new UserNotFoundException("User not found"));
        userService.changePassword(currentUser.getUserId(), request);
        return ResponseEntity.ok(APIResponse.success(null, "Password changed successfully"));
    }
}