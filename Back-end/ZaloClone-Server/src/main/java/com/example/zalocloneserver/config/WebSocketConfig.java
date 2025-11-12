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
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.server.HandshakeInterceptor;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

import java.net.URI;
import java.util.Map;

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
                )
                .addInterceptors(new HandshakeInterceptor() {
                    @Override
                    public boolean beforeHandshake(ServerHttpRequest request, ServerHttpResponse response,
                                                   WebSocketHandler wsHandler, Map<String, Object> attributes) throws Exception {
                        URI uri = request.getURI();
                        if (uri != null && uri.getQuery() != null) {
                            String query = uri.getQuery();
                            String[] params = query.split("&");
                            for (String param : params) {
                                String[] keyValue = param.split("=");
                                if (keyValue.length == 2 && "access_token".equals(keyValue[0])) {
                                    String token = java.net.URLDecoder.decode(keyValue[1], "UTF-8");
                                    attributes.put("access_token", token);
                                    System.out.println("[WebSocket] Token extracted from query params during handshake");
                                    break;
                                }
                            }
                        }
                        return true;
                    }

                    @Override
                    public void afterHandshake(ServerHttpRequest request, ServerHttpResponse response,
                                               WebSocketHandler wsHandler, Exception exception) {
                        // No-op
                    }
                });
    }

    @Override
    public void configureClientInboundChannel(ChannelRegistration registration) {
        registration.interceptors(new ChannelInterceptor() {
            @Override
            public org.springframework.messaging.Message<?> preSend(org.springframework.messaging.Message<?> message, MessageChannel channel) {
                StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);

                if (accessor != null && StompCommand.CONNECT.equals(accessor.getCommand())) {
                    System.out.println("[WebSocket] Received CONNECT frame");
                    String token = null;

                    // 1. Lấy token từ Authorization header
                    String authToken = accessor.getFirstNativeHeader("Authorization");
                    System.out.println("[WebSocket] Authorization header: " + (authToken != null ? "present" : "null"));
                    if (authToken != null && authToken.startsWith("Bearer ")) {
                        token = authToken.substring(7);
                        System.out.println("[WebSocket] Token extracted from Authorization header");
                    }

                    // 2. Nếu không có, lấy từ access_token header
                    if (token == null) {
                        String accessToken = accessor.getFirstNativeHeader("access_token");
                        System.out.println("[WebSocket] access_token header: " + (accessToken != null ? "present" : "null"));
                        if (accessToken != null) {
                            token = accessToken;
                            System.out.println("[WebSocket] Token extracted from access_token header");
                        }
                    }

                    // 3. Nếu vẫn không có, lấy từ session attributes (query params từ handshake)
                    if (token == null) {
                        Map<String, Object> sessionAttributes = accessor.getSessionAttributes();
                        if (sessionAttributes != null) {
                            Object sessionToken = sessionAttributes.get("access_token");
                            if (sessionToken != null) {
                                token = sessionToken.toString();
                                System.out.println("[WebSocket] Token extracted from session attributes (query params)");
                            }
                        }
                    }

                    // 4. Xác thực token
                    if (token != null) {
                        try {
                            System.out.println("[WebSocket] Validating token...");
                            String username = jwtUtil.extractUsername(token);

                            if (username != null && jwtUtil.validateToken(token, userDetailsService.loadUserByUsername(username))) {
                                System.out.println("[WebSocket] Token validated successfully for user: " + username);
                                UserDetails userDetails = userDetailsService.loadUserByUsername(username);
                                UsernamePasswordAuthenticationToken authentication =
                                        new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
                                SecurityContextHolder.getContext().setAuthentication(authentication);
                                accessor.setUser(authentication);
                            } else {
                                System.err.println("[WebSocket] Token validation failed for user: " + username);
                            }
                        } catch (Exception e) {
                            System.err.println("[WebSocket] JWT validation error: " + e.getMessage());
                            e.printStackTrace();
                            throw new RuntimeException("Invalid JWT token: " + e.getMessage());
                        }
                    } else {
                        System.err.println("[WebSocket] No token found in CONNECT frame");
                    }
                }

                return message;
            }
        });
    }
}

