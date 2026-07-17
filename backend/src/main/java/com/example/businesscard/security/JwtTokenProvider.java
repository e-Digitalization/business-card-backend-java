package com.example.businesscard.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.util.Date;

@Component
public class JwtTokenProvider {
    private final byte[] secretBytes;
    private final long expirationMs;

    public JwtTokenProvider(@Value("${app.jwt.secret}") String secret,
                            @Value("${app.jwt.expiration-ms}") long expirationMs) {
        this.secretBytes = secret.getBytes(StandardCharsets.UTF_8);
        this.expirationMs = expirationMs;
    }

    public String generateToken(String subject) {
        return generateToken(subject, "ADMIN", null);
    }

    public String generateToken(String subject, String role, Long userId) {
        Date now = new Date();
        Date expiry = new Date(now.getTime() + expirationMs);
        var builder = Jwts.builder()
            .setSubject(subject)
            .claim("role", role)
            .setIssuedAt(now)
            .setExpiration(expiry);
        if (userId != null) {
            builder.claim("uid", userId);
        }
        return builder
            .signWith(Keys.hmacShaKeyFor(secretBytes), SignatureAlgorithm.HS256)
            .compact();
    }

    public Claims getClaims(String token) {
        return Jwts.parserBuilder()
            .setSigningKey(Keys.hmacShaKeyFor(secretBytes))
            .build()
            .parseClaimsJws(token)
            .getBody();
    }

    public String getUsernameFromToken(String token) {
        return getClaims(token).getSubject();
    }

    public String getRoleFromToken(String token) {
        Object role = getClaims(token).get("role");
        return role == null ? "ADMIN" : role.toString();
    }

    public Long getUserIdFromToken(String token) {
        Object uid = getClaims(token).get("uid");
        if (uid instanceof Integer integer) {
            return integer.longValue();
        }
        if (uid instanceof Long longValue) {
            return longValue;
        }
        if (uid instanceof Number number) {
            return number.longValue();
        }
        return null;
    }

    public boolean validateToken(String token) {
        try {
            getClaims(token);
            return true;
        } catch (Exception ex) {
            return false;
        }
    }
}
