package com.example.businesscard.controller;

import com.example.businesscard.dto.*;
import com.example.businesscard.entity.AdminUser;
import com.example.businesscard.repository.AdminUserRepository;
import com.example.businesscard.security.JwtTokenProvider;
import com.example.businesscard.service.ClientAuthService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final AdminUserRepository adminUserRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;
    private final ClientAuthService clientAuthService;

    public AuthController(AdminUserRepository adminUserRepository,
                          PasswordEncoder passwordEncoder,
                          JwtTokenProvider tokenProvider,
                          ClientAuthService clientAuthService) {
        this.adminUserRepository = adminUserRepository;
        this.passwordEncoder = passwordEncoder;
        this.tokenProvider = tokenProvider;
        this.clientAuthService = clientAuthService;
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        AdminUser user = adminUserRepository.findByUsername(request.getUsername()).orElse(null);
        if (user == null || !passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        String token = tokenProvider.generateToken(user.getUsername(), "ADMIN", null);
        return ResponseEntity.ok(new LoginResponse(token));
    }

    @GetMapping("/google/status")
    public Map<String, Object> googleStatus() {
        return Map.of("enabled", clientAuthService.isGoogleConfigured());
    }

    @PostMapping("/google")
    public ResponseEntity<ClientAuthResponse> google(@Valid @RequestBody GoogleAuthRequest request) {
        try {
            return ResponseEntity.ok(clientAuthService.loginWithGoogle(request.getIdToken()));
        } catch (IllegalStateException ex) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, ex.getMessage());
        } catch (IllegalArgumentException ex) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, ex.getMessage());
        }
    }

    @PostMapping("/register")
    public ResponseEntity<ClientAuthResponse> register(@Valid @RequestBody ClientRegisterRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(clientAuthService.register(request));
    }

    @PostMapping("/client-login")
    public ResponseEntity<ClientAuthResponse> clientLogin(@Valid @RequestBody ClientLoginRequest request) {
        return ResponseEntity.ok(clientAuthService.login(request));
    }
}
