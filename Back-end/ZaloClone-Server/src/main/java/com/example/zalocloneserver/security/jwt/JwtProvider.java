package com.example.zalocloneserver.security.jwt;

import com.example.zalocloneserver.model.entity.UserTokenVersion;
import com.example.zalocloneserver.repository.IUserTokenVersionRepository;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.*;
import java.util.function.Function;

@Component
public class JwtProvider {

    @Autowired
    private IUserTokenVersionRepository userTokenVersionRepository;

    @Value("${jwt.secret.key}")
    private String SECRET_KEY;

    @Value("${jwt.expired.access}")
    private Long EXPIRED_ACCESS;

    @Value("${jwt.expired.refresh}")
    private Long EXPIRED_REFRESH;

    // ==================== Extract Methods ====================

    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    public List<String> extractRoles(String token) {
        Claims claims = extractAllClaims(token);
        return claims.get("roles", List.class);
    }

    public Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    private Claims extractAllClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSignKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    // ==================== Validation ====================

    private Boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    public Boolean validateToken(String token, UserDetails userDetails) {
        try {
            final String username = extractUsername(token);

            if (!username.equals(userDetails.getUsername()) || isTokenExpired(token)) {
                return false;
            }

            Claims claims = extractAllClaims(token);
            Integer tokenVersionInToken = claims.get("tokenVersion", Integer.class);

            Integer currentVersion = userTokenVersionRepository.findById(username)
                    .map(UserTokenVersion::getTokenVersion)
                    .orElse(0);

            return tokenVersionInToken != null && tokenVersionInToken.equals(currentVersion);

        } catch (Exception e) {
            return false;
        }
    }

    // ==================== Generate Token ====================

    public String generateToken(String username, List<String> roles) {
        Map<String, Object> claims = new HashMap<>();

        // Đảm bảo roles luôn có tiền tố ROLE_
        List<String> normalizedRoles = roles.stream()
                .map(role -> role.startsWith("ROLE_") ? role : "ROLE_" + role)
                .toList();

        claims.put("roles", normalizedRoles);

        Integer tokenVersion = userTokenVersionRepository.findById(username)
                .map(UserTokenVersion::getTokenVersion)
                .orElse(0);

        claims.put("tokenVersion", tokenVersion);

        return createToken(claims, username);
    }

    private String createToken(Map<String, Object> claims, String username) {
        return Jwts.builder()
                .setClaims(claims)
                .setSubject(username)
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + EXPIRED_ACCESS))
                .signWith(getSignKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    public String generateRefreshToken(String username) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("type", "refresh");
        
        Integer tokenVersion = userTokenVersionRepository.findById(username)
                .map(UserTokenVersion::getTokenVersion)
                .orElse(0);
        claims.put("tokenVersion", tokenVersion);

        return Jwts.builder()
                .setClaims(claims)
                .setSubject(username)
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + EXPIRED_REFRESH))
                .signWith(getSignKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    public Boolean validateRefreshToken(String token, UserDetails userDetails) {
        try {
            final String username = extractUsername(token);
            Claims claims = extractAllClaims(token);
            String tokenType = claims.get("type", String.class);
            
            if (!"refresh".equals(tokenType)) {
                return false;
            }

            if (!username.equals(userDetails.getUsername()) || isTokenExpired(token)) {
                return false;
            }

            Integer tokenVersionInToken = claims.get("tokenVersion", Integer.class);
            Integer currentVersion = userTokenVersionRepository.findById(username)
                    .map(UserTokenVersion::getTokenVersion)
                    .orElse(0);

            return tokenVersionInToken != null && tokenVersionInToken.equals(currentVersion);

        } catch (Exception e) {
            return false;
        }
    }

    private Key getSignKey() {
        byte[] keyBytes = Decoders.BASE64.decode(SECRET_KEY);
        return Keys.hmacShaKeyFor(keyBytes);
    }
}
