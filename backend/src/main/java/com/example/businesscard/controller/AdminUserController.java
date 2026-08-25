package com.example.businesscard.controller;

import com.example.businesscard.dto.AdminUserRequest;
import com.example.businesscard.dto.AdminUserResponse;
import com.example.businesscard.dto.ApiResponse;
import com.example.businesscard.dto.ResetPasswordRequest;
import com.example.businesscard.entity.AdminUser;
import com.example.businesscard.repository.AdminUserRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin/admin-users")
public class AdminUserController {
    private final AdminUserRepository adminUserRepository;
    private final PasswordEncoder passwordEncoder;

    public AdminUserController(AdminUserRepository adminUserRepository, PasswordEncoder passwordEncoder) {
        this.adminUserRepository = adminUserRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @GetMapping
    public ApiResponse<List<AdminUserResponse>> list() {
        List<AdminUserResponse> users = adminUserRepository.findAllByOrderByIdAsc().stream()
            .map(AdminUserResponse::new)
            .collect(Collectors.toList());
        return ApiResponse.ok(users);
    }

    @PostMapping
    public ResponseEntity<ApiResponse<AdminUserResponse>> create(@Valid @RequestBody AdminUserRequest request) {
        String username = request.getUsername().trim();
        if (adminUserRepository.existsByUsername(username)) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(fail(HttpStatus.CONFLICT, "That username is already taken."));
        }
        AdminUser user = new AdminUser();
        user.setUsername(username);
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setActive(true);
        AdminUser saved = adminUserRepository.save(user);
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(new ApiResponse<>(true, HttpStatus.CREATED.value(), "Admin created", new AdminUserResponse(saved)));
    }

    @PutMapping("/{id}/active")
    public ResponseEntity<ApiResponse<AdminUserResponse>> setActive(
        @PathVariable Long id,
        @RequestBody Map<String, Boolean> body,
        HttpServletRequest request
    ) {
        AdminUser user = adminUserRepository.findById(id).orElse(null);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(fail(HttpStatus.NOT_FOUND, "Admin not found"));
        }
        boolean nextActive = Boolean.TRUE.equals(body.get("active"));

        if (!nextActive) {
            String violation = lockoutViolation(user, request);
            if (violation != null) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(fail(HttpStatus.BAD_REQUEST, violation));
            }
        }

        user.setActive(nextActive);
        AdminUser saved = adminUserRepository.save(user);
        String message = nextActive ? "Admin re-enabled" : "Admin deactivated";
        return ResponseEntity.ok(new ApiResponse<>(true, HttpStatus.OK.value(), message, new AdminUserResponse(saved)));
    }

    @PostMapping("/{id}/reset-password")
    public ResponseEntity<ApiResponse<Void>> resetPassword(
        @PathVariable Long id,
        @Valid @RequestBody ResetPasswordRequest request
    ) {
        AdminUser user = adminUserRepository.findById(id).orElse(null);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(fail(HttpStatus.NOT_FOUND, "Admin not found"));
        }
        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        adminUserRepository.save(user);
        return ResponseEntity.ok(new ApiResponse<>(true, HttpStatus.OK.value(), "Password reset", null));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id, HttpServletRequest request) {
        AdminUser user = adminUserRepository.findById(id).orElse(null);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(fail(HttpStatus.NOT_FOUND, "Admin not found"));
        }

        String violation = lockoutViolation(user, request);
        if (violation != null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(fail(HttpStatus.BAD_REQUEST, violation));
        }

        adminUserRepository.delete(user);
        return ResponseEntity.ok(new ApiResponse<>(true, HttpStatus.OK.value(), "Admin removed", null));
    }

    // Blocks removing/deactivating yourself, and blocks removing the last active admin
    // account — both would otherwise lock every admin out with no way back in.
    // Returns null when the action is fine, otherwise the reason it's blocked.
    private String lockoutViolation(AdminUser target, HttpServletRequest request) {
        Object currentId = request.getAttribute("authUserId");
        if (currentId instanceof Long selfId && selfId.equals(target.getId())) {
            return "You can't remove or deactivate your own account.";
        }
        if (target.isActive() && adminUserRepository.countByActiveTrue() <= 1) {
            return "At least one active admin account must remain.";
        }
        return null;
    }

    private <T> ApiResponse<T> fail(HttpStatus status, String message) {
        return new ApiResponse<>(false, status.value(), message, null);
    }
}
