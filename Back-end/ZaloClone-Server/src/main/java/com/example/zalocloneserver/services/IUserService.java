package com.example.zalocloneserver.services;

import com.example.zalocloneserver.dto.req.auth.UserRequest;
import com.example.zalocloneserver.dto.req.user.ChangePasswordRequest;
import com.example.zalocloneserver.dto.res.user.UpdateProfileRequest;
import com.example.zalocloneserver.dto.res.user.UserProfileResponse;
import com.example.zalocloneserver.dto.res.user.UserResponse;
import com.example.zalocloneserver.model.entity.User;
import jakarta.validation.Valid;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public interface IUserService {
    User createUser(@Valid UserRequest user);
    UserResponse findById(@Valid Long id);
    UserProfileResponse updateMyProfile(@Valid UpdateProfileRequest user);
    void changePassword(@Valid Long id,ChangePasswordRequest request);
    UserResponse findByPhone(String phone);


}
