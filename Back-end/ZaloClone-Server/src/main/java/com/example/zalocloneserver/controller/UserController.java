package com.example.zalocloneserver.controller;

import com.example.zalocloneserver.dto.req.auth.UserRequest;
import com.example.zalocloneserver.dto.req.user.ChangePasswordRequest;
import com.example.zalocloneserver.dto.req.user.SearchUserRequest;
import com.example.zalocloneserver.dto.res.base.APIResponse;
import com.example.zalocloneserver.dto.res.user.UpdateProfileRequest;
import com.example.zalocloneserver.dto.res.user.UserProfileResponse;
import com.example.zalocloneserver.dto.res.user.UserResponse;
import org.springframework.web.multipart.MultipartFile;
import com.example.zalocloneserver.exception.UserNotFoundException;
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
@RequestMapping("/api/v1/users")
public class UserController {

    @Autowired
    private IUserRepository userRepository;

    @Autowired
    private IUserService userService;

    @GetMapping("/me")
    @Operation(summary = "Lấy thông tin profile hiện tại", description = "Lấy thông tin profile của người dùng đang đăng nhập")
    public ResponseEntity<APIResponse<UserResponse>> getCurrentUserProfile() {
        UserResponse userProfile = userService.getCurrentUserProfile();
        return ResponseEntity.ok(APIResponse.success(userProfile, "Get profile successfully"));
    }

    @PutMapping("/me")
    public ResponseEntity<UserProfileResponse> updateMyProfile(
            @Valid @RequestBody UpdateProfileRequest request
    ) {
        return ResponseEntity.ok(userService.updateMyProfile(request));
    }

    @PostMapping("/me/avatar")
    @Operation(summary = "Upload avatar", description = "Upload avatar cho người dùng hiện tại")
    public ResponseEntity<APIResponse<UserProfileResponse>> uploadAvatar(
            @RequestParam("avatar") MultipartFile file
    ) {
        UserProfileResponse profile = userService.uploadAvatar(file);
        return ResponseEntity.ok(APIResponse.success(profile, "Avatar uploaded successfully"));
    }

    @Operation(summary = "Đổi mật khẩu của người dùng hiện tại", description = "Đổi mật khẩu của người dùng hiện tại")
   @PostMapping("/change-password")
    public ResponseEntity<APIResponse<Void>> changePassword(@RequestBody @Valid ChangePasswordRequest request,
                                                            Principal principal) {
        User currentUser = userRepository.findByUsername(principal.getName())
                .orElseThrow(() -> new UserNotFoundException("User not found"));
        userService.changePassword(currentUser.getId(), request);
        return ResponseEntity.ok(APIResponse.success(null, "Password changed successfully"));
    }
    @PostMapping("/search")
    public ResponseEntity<APIResponse<UserResponse>> findByUsername(
            @RequestBody SearchUserRequest request
    ) {
        UserResponse data = userService.findByUsername(request);
        return ResponseEntity.ok(APIResponse.success(data, "Tìm kiếm người dùng thành công"));
    }

}