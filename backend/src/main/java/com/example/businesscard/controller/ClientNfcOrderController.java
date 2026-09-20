package com.example.businesscard.controller;

import com.example.businesscard.dto.ApiResponse;
import com.example.businesscard.dto.NfcCardRequestResponse;
import com.example.businesscard.entity.ClientUser;
import com.example.businesscard.entity.NfcCardRequest;
import com.example.businesscard.repository.NfcCardRequestRepository;
import com.example.businesscard.service.ClientAuthService;
import com.example.businesscard.service.ProductCatalogService;
import com.example.businesscard.service.PaymentCheckoutService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/client/nfc")
public class ClientNfcOrderController {
    private final ClientAuthService clientAuthService;
    private final PaymentCheckoutService paymentCheckoutService;
    private final ProductCatalogService productCatalogService;
    private final NfcCardRequestRepository nfcCardRequestRepository;

    public ClientNfcOrderController(
        ClientAuthService clientAuthService,
        PaymentCheckoutService paymentCheckoutService,
        ProductCatalogService productCatalogService,
        NfcCardRequestRepository nfcCardRequestRepository
    ) {
        this.clientAuthService = clientAuthService;
        this.paymentCheckoutService = paymentCheckoutService;
        this.productCatalogService = productCatalogService;
        this.nfcCardRequestRepository = nfcCardRequestRepository;
    }

    @GetMapping("/products")
    public ApiResponse<Map<String, Object>> products(HttpServletRequest request) {
        currentUser(request);
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("products", productCatalogService.listProducts());
        data.put("nfcCardPriceTzs", productCatalogService.nfcCardPriceTzs());
        data.put("nfcBilling", "one_time");
        data.put("currency", productCatalogService.currency());
        data.put("paymentProvider", paymentCheckoutService.statusProviderLabel());
        return ApiResponse.ok(data);
    }

    @GetMapping("/requests")
    public ApiResponse<List<NfcCardRequestResponse>> myRequests(HttpServletRequest request) {
        ClientUser user = currentUser(request);
        List<NfcCardRequestResponse> items = nfcCardRequestRepository.findByOwnerOrderByCreatedAtDesc(user).stream()
            .map(NfcCardRequestResponse::new)
            .collect(Collectors.toList());
        return ApiResponse.ok(items);
    }

    @PostMapping("/request")
    public ApiResponse<Map<String, Object>> requestCard(
        HttpServletRequest request,
        @RequestBody(required = false) Map<String, String> body
    ) {
        ClientUser user = currentUser(request);
        String productCode = body == null ? ProductCatalogService.NFC_CARD : body.getOrDefault("productCode", ProductCatalogService.NFC_CARD);
        productCatalogService.requireActiveProduct(productCode);
        if (!productCatalogService.isNfcCardProduct(productCode)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid card product.");
        }
        String phone = body == null ? null : body.get("phone");
        String notes = body == null ? null : body.get("deliveryNotes");
        return ApiResponse.ok(paymentCheckoutService.startNfcCheckout(user, phone, notes, productCode));
    }

    @PostMapping("/submit")
    public ApiResponse<NfcCardRequestResponse> submitCardRequest(
        HttpServletRequest request,
        @RequestBody Map<String, String> body
    ) {
        ClientUser user = currentUser(request);
        if (body == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Request body is required.");
        }
        String productCode = body.get("productCode");
        if (productCode == null || productCode.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Choose a card type.");
        }
        if (!productCatalogService.isNfcCardProduct(productCode)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid card product.");
        }
        Map<String, Object> product = productCatalogService.requireActiveProduct(productCode.trim());
        String phone = body.get("phone");
        if (phone == null || phone.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Phone number is required.");
        }
        String deliveryLocation = body.get("deliveryLocation");
        if (deliveryLocation == null) {
            deliveryLocation = body.get("deliveryNotes");
        }
        if (deliveryLocation == null || deliveryLocation.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Delivery location is required.");
        }

        NfcCardRequest cardRequest = new NfcCardRequest();
        cardRequest.setOwner(user);
        cardRequest.setProductCode(productCode.trim());
        cardRequest.setProductName(String.valueOf(product.get("name")));
        cardRequest.setAmount(((Number) product.get("priceTzs")).intValue());
        cardRequest.setCurrency(productCatalogService.currency());
        cardRequest.setStatus("PENDING");
        cardRequest.setPhone(phone.trim());
        cardRequest.setDeliveryNotes(deliveryLocation.trim());
        cardRequest = nfcCardRequestRepository.save(cardRequest);
        return ApiResponse.ok(new NfcCardRequestResponse(cardRequest));
    }

    private ClientUser currentUser(HttpServletRequest request) {
        Object uid = request.getAttribute("authUserId");
        if (!(uid instanceof Long userId)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Missing client session.");
        }
        return clientAuthService.requireUser(userId);
    }
}
