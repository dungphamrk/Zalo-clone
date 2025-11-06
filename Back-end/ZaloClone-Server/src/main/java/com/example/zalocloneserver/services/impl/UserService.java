package com.example.zalocloneserver.services.impl;

import com.example.zalocloneserver.dto.req.auth.UserRequest;
import com.example.zalocloneserver.dto.req.user.ChangePasswordRequest;
import com.example.zalocloneserver.dto.res.user.UpdateProfileRequest;
import com.example.zalocloneserver.dto.res.user.UserProfileResponse;
import com.example.zalocloneserver.dto.res.user.UserResponse;
import com.example.zalocloneserver.exception.UserNotFoundException;
import com.example.zalocloneserver.model.entity.User;
import com.example.zalocloneserver.repository.IUserRepository;
import com.example.zalocloneserver.services.IUserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class UserService implements IUserService {

    @Autowired
    private IUserRepository userRepository;

    @Override
    public User createUser(UserRequest user) {
        return null;
    }

    @Override
    public UserResponse findById(Long id) {
        return null;
    }

    @Override
    public UserProfileResponse updateMyProfile(UpdateProfileRequest user) {
        return null;
    }

    @Override
    public void changePassword(Long id, ChangePasswordRequest request) {

    }
    @Override
    public UserResponse findByPhone(String phone) {
        User user = userRepository.findByPhone(phone)
                .orElseThrow(() -> new UserNotFoundException("Không tìm thấy người dùng với số điện thoại này"));
        return UserResponse.builder()
                .id(user.getId())
                .phone(user.getPhone())
                .email(user.getEmail())
                .displayName(user.getDisplayName())
                .status(user.getStatus())
                .build();
    }

}
