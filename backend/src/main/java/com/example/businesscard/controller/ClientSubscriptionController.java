package com.example.businesscard.controller;

import com.example.businesscard.dto.ApiResponse;
import com.example.businesscard.entity.ClientUser;
import com.example.businesscard.service.ClientAuthService;
import com.example.businesscard.service.ScanQuotaService;
import com.example.businesscard.service.SelcomCheckoutService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.LinkedHashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/client/subscription")
public class ClientSubscriptionController {
    private final ClientAuthService clientAuthService;
    private final ScanQuotaService scanQuotaService;
    private final SelcomCheckoutService selcomCheckoutService;

    public ClientSubscriptionController(
        ClientAuthService clientAuthService,
        ScanQuotaService scanQuotaService,
        SelcomCheckoutService selcomCheckoutService
    ) {
        this.clientAuthService = clientAuthService;
        this.scanQuotaService = scanQuotaService;
        this.selcomCheckoutService = selcomCheckoutService;
    }

    @GetMapping
    public ApiResponse<Map<String, Object>> status(HttpServletRequest request) {
        ClientUser user = currentUser(request);
        Map<String, Object> data = new LinkedHashMap<>(scanQuotaService.quotaSnapshot(user));
        data.put("priceTzs", selcomCheckoutService.amountTzs());
        data.put("currency", selcomCheckoutService.currency());
        data.put("provider", selcomCheckoutService.isLiveConfigured() ? "selcom" : "mock");
        data.put("billingPeriod", "monthly");
        data.put("productName", "AI Scan Monthly");
        return ApiResponse.ok(data);
    }

    @PostMapping("/checkout")
    public ApiResponse<Map<String, Object>> checkout(HttpServletRequest request,
                                                     @RequestBody(required = false) Map<String, String> body) {
        ClientUser user = currentUser(request);
        String phone = body == null ? null : body.get("phone");
        return ApiResponse.ok(selcomCheckoutService.startCheckout(user, phone));
    }

    @PostMapping("/mock-pay")
    public ApiResponse<Map<String, Object>> mockPay(HttpServletRequest request,
                                                    @RequestBody Map<String, String> body) {
        ClientUser user = currentUser(request);
        String orderId = body == null ? null : body.get("orderId");
        if (orderId == null || orderId.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "orderId is required.");
        }
        return ApiResponse.ok(selcomCheckoutService.completeMockPayment(user, orderId));
    }

    @GetMapping("/orders/{orderId}")
    public ApiResponse<Map<String, Object>> orderStatus(HttpServletRequest request, @PathVariable String orderId) {
        ClientUser user = currentUser(request);
        return ApiResponse.ok(selcomCheckoutService.refreshOrderStatus(user, orderId));
    }

    private ClientUser currentUser(HttpServletRequest request) {
        Object uid = request.getAttribute("authUserId");
        if (!(uid instanceof Long userId)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Missing client session.");
        }
        return clientAuthService.requireUser(userId);
    }
}
