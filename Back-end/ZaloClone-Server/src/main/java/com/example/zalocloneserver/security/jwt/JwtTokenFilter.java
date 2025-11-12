package com.example.zalocloneserver.security.jwt;

import com.example.zalocloneserver.security.principle.MyUserDetailsService;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.MalformedJwtException;
import io.jsonwebtoken.security.SignatureException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Slf4j
@Component
@RequiredArgsConstructor
public class JwtTokenFilter extends OncePerRequestFilter {

    private final MyUserDetailsService userDetailsService;
    private final JwtProvider jwtProvider;

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain) throws ServletException, IOException {

        try {
            String token = getTokenFromRequest(request);

            // Nếu có token và context chưa có authentication thì mới xử lý
            if (token != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                String username = jwtProvider.extractUsername(token);

                UserDetails userDetails = userDetailsService.loadUserByUsername(username);

                if (jwtProvider.validateToken(token, userDetails)) {
                    UsernamePasswordAuthenticationToken authentication =
                            new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
                    authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                    SecurityContextHolder.getContext().setAuthentication(authentication);
                }

            }

        } catch (ExpiredJwtException e) {
            log.warn("JWT expired: {}", e.getMessage());
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.getWriter().write("Token expired");
            return;
        } catch (SignatureException | MalformedJwtException e) {
            log.warn("Invalid JWT: {}", e.getMessage());
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.getWriter().write("Invalid token");
            return;
        } catch (Exception e) {
            log.error("JWT filter error: {}", e.getMessage());
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.getWriter().write("Authentication error");
            return;
        }

        filterChain.doFilter(request, response);
    }

    private String getTokenFromRequest(HttpServletRequest request) {
        String header = request.getHeader("Authorization");
        if (header != null && header.startsWith("Bearer ")) {
            return header.substring(7);
        }
        return null;
    }
}
