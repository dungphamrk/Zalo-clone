package com.example.zalocloneserver.config;

import com.example.zalocloneserver.security.exception.JwtEntryPoint;
import com.example.zalocloneserver.security.jwt.JwtProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
@RequiredArgsConstructor
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    private final JwtProvider jwtUtil;
    private final UserDetailsService userDetailsService;

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        config.enableSimpleBroker("/topic", "/queue");
        config.setApplicationDestinationPrefixes("/app");
        config.setUserDestinationPrefix("/user");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // WebSocket thuần - KHÔNG dùng SockJS
        registry.addEndpoint("/ws")
                // ✅ Dùng pattern để hỗ trợ mọi IP trong LAN + Expo
                .setAllowedOriginPatterns(
                    "http://localhost:*",
                    "http://127.0.0.1:*",
                    "http://192.168.*.*:*",
                    "http://10.*.*.*:*",
                    "exp://*"
                );
    }

    @Override
    public void configureClientInboundChannel(ChannelRegistration registration) {
        registration.interceptors(new ChannelInterceptor() {
            @Override
            public org.springframework.messaging.Message<?> preSend(org.springframework.messaging.Message<?> message, MessageChannel channel) {
                StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);

                if (accessor != null && StompCommand.CONNECT.equals(accessor.getCommand())) {
                    String token = null;

                    // 1. Lấy token từ Authorization header
                    String authToken = accessor.getFirstNativeHeader("Authorization");
                    if (authToken != null && authToken.startsWith("Bearer ")) {
                        token = authToken.substring(7);
                    }

                    // 2. Nếu không có, lấy từ query params (access_token)
                    if (token == null) {
                        String accessToken = accessor.getFirstNativeHeader("access_token");
                        if (accessToken != null) {
                            token = accessToken;
                        }
                    }

                    // 3. Xác thực token
                    if (token != null) {
                        try {
                            String username = jwtUtil.extractUsername(token);

                            if (username != null && jwtUtil.validateToken(token, userDetailsService.loadUserByUsername(username))) {
                                UserDetails userDetails = userDetailsService.loadUserByUsername(username);
                                UsernamePasswordAuthenticationToken authentication =
                                        new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
                                SecurityContextHolder.getContext().setAuthentication(authentication);
                                accessor.setUser(authentication);
                            }
                        } catch (Exception e) {
                            System.err.println("WebSocket JWT validation error: " + e.getMessage());
                            throw new RuntimeException("Invalid JWT token");
                        }
                    }
                }

                return message;
            }
        });
    }
}

