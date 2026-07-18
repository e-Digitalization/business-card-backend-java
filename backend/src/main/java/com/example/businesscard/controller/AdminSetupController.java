package com.example.businesscard.controller;

import com.example.businesscard.dto.ApiResponse;
import com.example.businesscard.service.AppSettingsService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin/setups")
public class AdminSetupController {
    private final AppSettingsService appSettingsService;

    public AdminSetupController(AppSettingsService appSettingsService) {
        this.appSettingsService = appSettingsService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Map<String, Object>>> get() {
        return ResponseEntity.ok(new ApiResponse<>(true, 200, "Setups loaded", appSettingsService.adminSnapshot()));
    }

    @PutMapping
    public ResponseEntity<ApiResponse<Map<String, Object>>> update(@RequestBody Map<String, Object> body) {
        return ResponseEntity.ok(new ApiResponse<>(
            true,
            200,
            "Setups saved",
            appSettingsService.updateFromAdmin(body)
        ));
    }
}
