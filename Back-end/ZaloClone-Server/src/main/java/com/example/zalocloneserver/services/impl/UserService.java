package com.example.zalocloneserver.services.impl;

import com.example.zalocloneserver.dto.req.auth.UserRequest;
import com.example.zalocloneserver.dto.req.user.ChangePasswordRequest;
import com.example.zalocloneserver.dto.req.user.SearchUserRequest;
import com.example.zalocloneserver.dto.res.user.UpdateProfileRequest;
import com.example.zalocloneserver.dto.res.user.UserProfileResponse;
import com.example.zalocloneserver.dto.res.user.UserResponse;
import com.example.zalocloneserver.exception.UserNotFoundException;
import com.example.zalocloneserver.model.constants.Presence;
import com.example.zalocloneserver.model.constants.Role;
import com.example.zalocloneserver.model.constants.UserStatus;
import com.example.zalocloneserver.model.entity.User;
import com.example.zalocloneserver.model.entity.UserProfile;
import com.example.zalocloneserver.repository.IUserProfileRepository;
import com.example.zalocloneserver.repository.IUserRepository;
import com.example.zalocloneserver.services.IUserService;
import com.example.zalocloneserver.services.cloudinary.CloudinaryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;

@Service
public class UserService implements IUserService {

    @Autowired
    private IUserRepository userRepository;
    @Autowired
    private IUserProfileRepository userProfileRepository;
    @Autowired
    private PasswordEncoder passwordEncoder;
    @Autowired
    private CloudinaryService cloudinaryService;
    @Override
    public UserResponse createUser(UserRequest userRequest) {
        userRepository.findByUsername(userRequest.getUsername())
                .ifPresent(u -> {
                    throw new IllegalArgumentException("Số điện thoại đã tồn tại!");
                });

        User user = User.builder()
                .username(userRequest.getUsername())
                .password(passwordEncoder.encode(userRequest.getPassword()))
                .status(UserStatus.ACTIVE)
                .role(Role.USER)
                .updatedAt(LocalDateTime.now())
                .createdAt(LocalDateTime.now())
                .build();


        UserProfile profile = UserProfile.builder()
                .displayName(userRequest.getDisplayName())
                .presence(Presence.ONLINE)
                .user(user)
                .build();

        user.setProfile(profile);

        userRepository.save(user);

        // Map sang response
        return UserResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .status(user.getStatus())
                .profile(UserProfileResponse.fromEntity(profile))
                .build();
    }

    // ====================== GET CURRENT USER PROFILE ======================
    @Override
    public UserResponse getCurrentUserProfile() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        User currentUser = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        return UserResponse.builder()
                .id(currentUser.getId())
                .username(currentUser.getUsername())
                .email(currentUser.getEmail())
                .status(currentUser.getStatus())
                .profile(UserProfileResponse.fromEntity(currentUser.getProfile()))
                .build();
    }

    // ====================== UPDATE MY PROFILE ======================
    @Override
    public UserProfileResponse updateMyProfile(UpdateProfileRequest request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        User currentUser = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        UserProfile profile = currentUser.getProfile();
        profile.setDisplayName(request.getDisplayName());
        profile.setAvatarUrl(request.getAvatarUrl());
        profile.setBirthday(request.getBirthday());
        profile.setGender(request.getGender());
        currentUser.setProfile(profile);
        userRepository.save(currentUser);

        return UserProfileResponse.builder()
                .avatarUrl(profile.getAvatarUrl())
                .displayName(profile.getDisplayName())
                .birthday(profile.getBirthday())
                .gender(profile.getGender())
                .build();
    }

    // ====================== UPLOAD AVATAR ======================
    @Override
    public UserProfileResponse uploadAvatar(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Avatar file is required");
        }
        
        if (!file.getContentType().startsWith("image/")) {
            throw new IllegalArgumentException("File must be an image");
        }
        
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        User currentUser = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        UserProfile profile = currentUser.getProfile();
        if (profile == null) {
            throw new RuntimeException("User profile not found");
        }
        
        try {
            String avatarUrl = cloudinaryService.uploadImage(file);
            profile.setAvatarUrl(avatarUrl);
            currentUser.setProfile(profile);
            userRepository.save(currentUser);
            
            return UserProfileResponse.builder()
                    .avatarUrl(profile.getAvatarUrl())
                    .displayName(profile.getDisplayName())
                    .birthday(profile.getBirthday())
                    .gender(profile.getGender())
                    .presence(profile.getPresence())
                    .lastActive(profile.getLastActive())
                    .build();
        } catch (IOException e) {
            throw new RuntimeException("Failed to upload avatar: " + e.getMessage(), e);
        }
    }

    // ====================== CHANGE PASSWORD ======================
    @Override
    public void changePassword(Long id, ChangePasswordRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new UserNotFoundException("Không tìm thấy người dùng"));

        if (!passwordEncoder.matches(request.getOldPassword(), user.getPassword())) {
            throw new IllegalArgumentException("Mật khẩu cũ không chính xác!");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }

    @Override
    public UserResponse findByUsername(SearchUserRequest request) {
        User user = userRepository.findByUsername(request.getUserName())
                .orElseThrow(() -> new UserNotFoundException("Không tìm thấy người dùng với số điện thoại này"));
        return UserResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .status(user.getStatus())
                .build();
    }

}
