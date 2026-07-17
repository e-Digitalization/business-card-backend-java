package com.example.businesscard.controller;

import com.example.businesscard.dto.ApiResponse;
import com.example.businesscard.service.SelcomCheckoutService;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/payments/selcom")
public class SelcomWebhookController {
    private final SelcomCheckoutService selcomCheckoutService;

    public SelcomWebhookController(SelcomCheckoutService selcomCheckoutService) {
        this.selcomCheckoutService = selcomCheckoutService;
    }

    @PostMapping("/webhook")
    public ApiResponse<Map<String, String>> webhook(@RequestBody Map<String, Object> body) {
        selcomCheckoutService.handleWebhook(body);
        return ApiResponse.ok(Map.of("result", "SUCCESS"));
    }
}
