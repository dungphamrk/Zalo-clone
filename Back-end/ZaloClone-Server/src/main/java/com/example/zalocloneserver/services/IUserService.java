package com.example.zalocloneserver.services;

import com.example.zalocloneserver.dto.req.auth.UserRequest;
import com.example.zalocloneserver.dto.req.user.ChangePasswordRequest;
import com.example.zalocloneserver.dto.req.user.SearchUserRequest;
import com.example.zalocloneserver.dto.res.user.UpdateProfileRequest;
import com.example.zalocloneserver.dto.res.user.UserProfileResponse;
import com.example.zalocloneserver.dto.res.user.UserResponse;
import jakarta.validation.Valid;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public interface IUserService {
    UserResponse createUser(@Valid UserRequest user);
    UserResponse getCurrentUserProfile();
    UserProfileResponse updateMyProfile(@Valid UpdateProfileRequest user);
    UserProfileResponse uploadAvatar(org.springframework.web.multipart.MultipartFile file);
    void changePassword(@Valid Long id,ChangePasswordRequest request);
    UserResponse findByUsername(SearchUserRequest request);

}
