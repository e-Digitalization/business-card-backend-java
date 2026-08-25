package com.example.businesscard.dto;

import com.example.businesscard.entity.AdminUser;

import java.time.Instant;

public class AdminUserResponse {
    private Long id;
    private String username;
    private boolean active;
    private Instant createdAt;

    public AdminUserResponse(AdminUser user) {
        this.id = user.getId();
        this.username = user.getUsername();
        this.active = user.isActive();
        this.createdAt = user.getCreatedAt();
    }

    public Long getId() {
        return id;
    }

    public String getUsername() {
        return username;
    }

    public boolean isActive() {
        return active;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }
}
