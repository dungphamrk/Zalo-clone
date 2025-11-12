package com.example.zalocloneserver.services.impl;

import com.example.zalocloneserver.dto.req.auth.FormLogin;
import com.example.zalocloneserver.dto.req.auth.JwtResponse;
import com.example.zalocloneserver.dto.req.auth.RefreshTokenRequest;
import com.example.zalocloneserver.dto.res.auth.RefreshTokenResponse;
import com.example.zalocloneserver.dto.res.user.UserProfileResponse;
import com.example.zalocloneserver.dto.res.user.UserResponse;
import com.example.zalocloneserver.model.entity.User;
import com.example.zalocloneserver.model.entity.UserTokenVersion;
import com.example.zalocloneserver.repository.IUserRepository;
import com.example.zalocloneserver.repository.IUserTokenVersionRepository;
import com.example.zalocloneserver.security.jwt.JwtProvider;
import com.example.zalocloneserver.security.principle.MyUserDetails;
import com.example.zalocloneserver.security.principle.MyUserDetailsService;
import com.example.zalocloneserver.services.IAuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class AuthService implements IAuthService {

    @Autowired
    private IUserRepository userRepository;
    @Autowired
    private  PasswordEncoder passwordEncoder;
    @Autowired
    private  AuthenticationManager authenticationManager;
    @Autowired
    private  JwtProvider jwtProvider;
    @Autowired
    private  JavaMailSender javaMailSender;
    @Autowired
    private IUserTokenVersionRepository userTokenVersionRepository;
    @Autowired
    private MyUserDetailsService userDetailsService;
    
    @Override
    public JwtResponse login(FormLogin formLogin) {
        Authentication authentication;
        try {
            authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            formLogin.getUsername(),
                            formLogin.getPassword()
                    )
            );
            // set vào context
            SecurityContextHolder.getContext().setAuthentication(authentication);
        } catch (AuthenticationException e) {
            throw new BadCredentialsException("Tên đăng nhập hoặc mật khẩu không đúng");
        }

        MyUserDetails userDetails = (MyUserDetails) authentication.getPrincipal();

        List<String> roles = userDetails.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.toList());

        String accessToken = jwtProvider.generateToken(userDetails.getUsername(), roles);
        String refreshToken = jwtProvider.generateRefreshToken(userDetails.getUsername());
        
        User currentUser = userDetails.getUser();
        UserResponse userResponse = UserResponse.builder()
                .id(currentUser.getId())
                .username(currentUser.getUsername())
                .email(currentUser.getEmail())
                .status(currentUser.getStatus())
                .profile(UserProfileResponse.fromEntity(currentUser.getProfile()))
                .build();
        return JwtResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .user(userResponse)
                .build();
    }

    @Override
    public Object logout() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();

        UserTokenVersion tokenVersion = userTokenVersionRepository.findById(username)
                .orElse(new UserTokenVersion(username, 0));

        tokenVersion.setTokenVersion(tokenVersion.getTokenVersion() + 1);
        userTokenVersionRepository.save(tokenVersion);

        return "User " + username + " logged out";
    }

    @Override
    public RefreshTokenResponse refreshToken(RefreshTokenRequest request) {
        try {
            String refreshToken = request.getRefreshToken();
            
            // Extract username from refresh token
            String username = jwtProvider.extractUsername(refreshToken);
            
            // Load user details
            UserDetails userDetails = userDetailsService.loadUserByUsername(username);
            
            // Validate refresh token
            if (!jwtProvider.validateRefreshToken(refreshToken, userDetails)) {
                throw new BadCredentialsException("Invalid or expired refresh token");
            }
            
            // Generate new tokens
            MyUserDetails myUserDetails = (MyUserDetails) userDetails;
            List<String> roles = myUserDetails.getAuthorities().stream()
                    .map(GrantedAuthority::getAuthority)
                    .collect(Collectors.toList());
            
            String newAccessToken = jwtProvider.generateToken(username, roles);
            String newRefreshToken = jwtProvider.generateRefreshToken(username);
            
            return RefreshTokenResponse.builder()
                    .accessToken(newAccessToken)
                    .refreshToken(newRefreshToken)
                    .build();
                    
        } catch (Exception e) {
            throw new BadCredentialsException("Invalid refresh token: " + e.getMessage());
        }
    }
}
