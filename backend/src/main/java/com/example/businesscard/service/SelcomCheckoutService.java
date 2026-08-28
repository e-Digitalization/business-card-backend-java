package com.example.businesscard.service;

import com.example.businesscard.entity.ClientUser;
import com.example.businesscard.entity.NfcCardRequest;
import com.example.businesscard.entity.PaymentOrder;
import com.example.businesscard.repository.ClientUserRepository;
import com.example.businesscard.repository.NfcCardRequestRepository;
import com.example.businesscard.repository.PaymentOrderRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Base64;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.UUID;

@Service
public class SelcomCheckoutService {
    private static final DateTimeFormatter TIMESTAMP =
        DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ssXXX");

    private final PaymentOrderRepository paymentOrderRepository;
    private final ClientUserRepository clientUserRepository;
    private final NfcCardRequestRepository nfcCardRequestRepository;
    private final ProductCatalogService productCatalogService;
    private final ScanQuotaService scanQuotaService;
    private final AppSettingsService appSettingsService;
    private final ObjectMapper objectMapper;
    private final HttpClient httpClient = HttpClient.newHttpClient();

    private final String frontendBaseUrl;
    private final String webhookBaseUrl;

    public SelcomCheckoutService(
        PaymentOrderRepository paymentOrderRepository,
        ClientUserRepository clientUserRepository,
        NfcCardRequestRepository nfcCardRequestRepository,
        ProductCatalogService productCatalogService,
        ScanQuotaService scanQuotaService,
        AppSettingsService appSettingsService,
        ObjectMapper objectMapper,
        @Value("${app.frontend.base-url:http://localhost:5173}") String frontendBaseUrl,
        @Value("${app.public.base-url:http://localhost:8080}") String webhookBaseUrl
    ) {
        this.paymentOrderRepository = paymentOrderRepository;
        this.clientUserRepository = clientUserRepository;
        this.nfcCardRequestRepository = nfcCardRequestRepository;
        this.productCatalogService = productCatalogService;
        this.scanQuotaService = scanQuotaService;
        this.appSettingsService = appSettingsService;
        this.objectMapper = objectMapper;
        this.frontendBaseUrl = trimSlash(frontendBaseUrl);
        this.webhookBaseUrl = trimSlash(webhookBaseUrl);
    }

    public boolean isLiveConfigured() {
        return appSettingsService.selcomLiveConfigured();
    }

    public int amountTzs() {
        return appSettingsService.selcomAmountTzs();
    }

    public String currency() {
        return appSettingsService.selcomCurrency();
    }

    @Transactional
    public Map<String, Object> startCheckout(ClientUser user, String phone) {
        if (scanQuotaService.hasActiveSubscription(user)) {
            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "Your AI scan monthly subscription is still active until "
                    + (user.getScanSubscriptionExpiresAt() == null ? "further notice" : user.getScanSubscriptionExpiresAt())
            );
        }
        return createAndPay(
            user,
            phone,
            ProductCatalogService.AI_SCAN,
            amountTzs(),
            "Kadi Moja AI scan monthly subscription",
            "/me/contacts",
            null
        );
    }

    @Transactional
    public Map<String, Object> startNfcCardCheckout(ClientUser user, String phone, String deliveryNotes) {
        Map<String, Object> product = productCatalogService.requireActiveProduct(ProductCatalogService.NFC_CARD);
        int price = ((Number) product.get("priceTzs")).intValue();

        NfcCardRequest request = new NfcCardRequest();
        request.setOwner(user);
        request.setProductCode(ProductCatalogService.NFC_CARD);
        request.setProductName(String.valueOf(product.get("name")));
        request.setAmount(price);
        request.setCurrency(currency());
        request.setStatus("PENDING_PAYMENT");
        request.setPhone(normalizePhone(phone));
        request.setDeliveryNotes(deliveryNotes == null ? null : deliveryNotes.trim());
        request = nfcCardRequestRepository.save(request);

        Map<String, Object> checkout = createAndPay(
            user,
            phone,
            ProductCatalogService.NFC_CARD,
            price,
            "Kadi Moja NFC card",
            "/me/looks",
            request.getId()
        );

        request.setPaymentOrderId(String.valueOf(checkout.get("orderId")));
        nfcCardRequestRepository.save(request);
        checkout.put("nfcRequestId", request.getId());
        checkout.put("productCode", ProductCatalogService.NFC_CARD);
        return checkout;
    }

    @Transactional
    public Map<String, Object> completeMockPayment(ClientUser user, String orderId) {
        if (isLiveConfigured()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Mock payment is disabled when Selcom is configured.");
        }
        PaymentOrder order = paymentOrderRepository.findByOrderId(orderId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Order not found."));
        if (!order.getOwner().getId().equals(user.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Order does not belong to this account.");
        }
        markPaid(order, "MOCK", "LOCAL", null);
        ClientUser fresh = clientUserRepository.findById(user.getId()).orElse(user);
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("orderId", order.getOrderId());
        result.put("status", order.getStatus());
        result.put("purpose", order.getPurpose());
        result.put("subscribed", scanQuotaService.hasActiveSubscription(fresh));
        result.put("expiresAt", fresh.getScanSubscriptionExpiresAt() == null ? null : fresh.getScanSubscriptionExpiresAt().toString());
        return result;
    }

    @Transactional
    public void handleWebhook(Map<String, Object> body) {
        String orderId = stringVal(body.get("order_id"));
        if (orderId == null || orderId.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Missing order_id.");
        }
        PaymentOrder order = paymentOrderRepository.findByOrderId(orderId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Order not found."));

        String paymentStatus = stringVal(body.get("payment_status"));
        String result = stringVal(body.get("result"));
        boolean success = "SUCCESS".equalsIgnoreCase(result)
            || "COMPLETED".equalsIgnoreCase(paymentStatus)
            || "COMPLETE".equalsIgnoreCase(paymentStatus);

        if (!success) {
            order.setStatus("FAILED");
            paymentOrderRepository.save(order);
            if (order.getNfcRequestId() != null) {
                nfcCardRequestRepository.findById(order.getNfcRequestId()).ifPresent(req -> {
                    req.setStatus("CANCELLED");
                    nfcCardRequestRepository.save(req);
                });
            }
            return;
        }

        markPaid(
            order,
            stringVal(body.get("reference")),
            stringVal(body.get("channel")),
            stringVal(body.get("phone"))
        );
    }

    @Transactional
    public Map<String, Object> refreshOrderStatus(ClientUser user, String orderId) {
        PaymentOrder order = paymentOrderRepository.findByOrderId(orderId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Order not found."));
        if (!order.getOwner().getId().equals(user.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Order does not belong to this account.");
        }
        ClientUser fresh = clientUserRepository.findById(user.getId()).orElse(user);
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("orderId", order.getOrderId());
        map.put("status", order.getStatus());
        map.put("purpose", order.getPurpose());
        map.put("subscribed", scanQuotaService.hasActiveSubscription(fresh));
        map.put("expiresAt", fresh.getScanSubscriptionExpiresAt() == null ? null : fresh.getScanSubscriptionExpiresAt().toString());
        map.put("paymentGatewayUrl", order.getPaymentGatewayUrl() == null ? "" : order.getPaymentGatewayUrl());
        map.put("nfcRequestId", order.getNfcRequestId());
        return map;
    }

    private Map<String, Object> createAndPay(
        ClientUser user,
        String phone,
        String purpose,
        int amount,
        String remarks,
        String returnPath,
        Long nfcRequestId
    ) {
        String orderId = "KM" + System.currentTimeMillis() + UUID.randomUUID().toString().substring(0, 6).toUpperCase();
        PaymentOrder order = new PaymentOrder();
        order.setOwner(user);
        order.setOrderId(orderId);
        order.setAmount(amount);
        order.setCurrency(currency());
        order.setPurpose(purpose);
        order.setStatus("PENDING");
        order.setPhone(normalizePhone(phone));
        order.setNfcRequestId(nfcRequestId);

        if (!isLiveConfigured()) {
            String mockUrl = frontendBaseUrl + returnPath + "?pay=mock&order=" + orderId;
            order.setPaymentGatewayUrl(mockUrl);
            order.setPaymentToken("MOCK");
            paymentOrderRepository.save(order);
            return checkoutResponse(order, true);
        }

        try {
            Map<String, Object> payload = buildMinimalOrderPayload(user, order, remarks, returnPath);
            JsonNode response = postSelcom("/v1/checkout/create-order-minimal", payload);
            String result = text(response, "result");
            String resultcode = text(response, "resultcode");
            if (!"SUCCESS".equalsIgnoreCase(result) && !"000".equals(resultcode)) {
                String message = text(response, "message");
                throw new ResponseStatusException(
                    HttpStatus.BAD_GATEWAY,
                    message == null || message.isBlank() ? "Selcom checkout failed." : message
                );
            }

            JsonNode data = response.path("data");
            if (data.isArray() && !data.isEmpty()) {
                JsonNode first = data.get(0);
                String gatewayUrl = decodeMaybeBase64(text(first, "payment_gateway_url"));
                order.setPaymentGatewayUrl(gatewayUrl);
                order.setPaymentToken(text(first, "payment_token"));
            }
            paymentOrderRepository.save(order);
            return checkoutResponse(order, false);
        } catch (ResponseStatusException ex) {
            throw ex;
        } catch (Exception ex) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Could not start Selcom payment: " + ex.getMessage());
        }
    }

    @Transactional
    public void markPaid(PaymentOrder order, String reference, String channel, String phone) {
        if ("PAID".equalsIgnoreCase(order.getStatus())) {
            applyFulfillment(order);
            return;
        }
        order.setStatus("PAID");
        order.setPaidAt(Instant.now());
        if (reference != null && !reference.isBlank()) order.setSelcomReference(reference);
        if (channel != null && !channel.isBlank()) order.setChannel(channel);
        if (phone != null && !phone.isBlank()) order.setPhone(phone);
        paymentOrderRepository.save(order);
        applyFulfillment(order);
    }

    private void applyFulfillment(PaymentOrder order) {
        if (ProductCatalogService.AI_SCAN.equals(order.getPurpose())) {
            ensureSubscribed(order.getOwner());
            return;
        }
        if (ProductCatalogService.NFC_CARD.equals(order.getPurpose())) {
            Long requestId = order.getNfcRequestId();
            NfcCardRequest request = requestId != null
                ? nfcCardRequestRepository.findById(requestId).orElse(null)
                : nfcCardRequestRepository.findByPaymentOrderId(order.getOrderId()).orElse(null);
            if (request == null) return;
            if (!"PAID".equals(request.getStatus()) && !"FULFILLING".equals(request.getStatus())
                && !"FULFILLED".equals(request.getStatus())) {
                request.setStatus("PAID");
                request.setPaidAt(Instant.now());
                if (request.getPaymentOrderId() == null) {
                    request.setPaymentOrderId(order.getOrderId());
                }
                nfcCardRequestRepository.save(request);
            }
        }
    }

    private void ensureSubscribed(ClientUser owner) {
        ClientUser user = clientUserRepository.findById(owner.getId())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found."));
        Instant now = Instant.now();
        ZoneId zone = ZoneId.of("Africa/Dar_es_Salaam");
        Instant currentExpiry = user.getScanSubscriptionExpiresAt();
        ZonedDateTime base = (currentExpiry != null && currentExpiry.isAfter(now))
            ? currentExpiry.atZone(zone)
            : now.atZone(zone);
        Instant newExpiry = base.plusMonths(1).toInstant();
        user.setScanSubscribed(true);
        if (user.getScanSubscribedAt() == null) {
            user.setScanSubscribedAt(now);
        }
        user.setScanSubscriptionExpiresAt(newExpiry);
        // Each paid month starts the monthly scan allowance fresh.
        user.setScanSubscriptionUsed(0);
        clientUserRepository.save(user);
    }

    private Map<String, Object> buildMinimalOrderPayload(
        ClientUser user,
        PaymentOrder order,
        String remarks,
        String returnPath
    ) {
        String redirect = frontendBaseUrl + returnPath + "?pay=success&order=" + order.getOrderId();
        String cancel = frontendBaseUrl + returnPath + "?pay=cancel&order=" + order.getOrderId();
        String webhook = webhookBaseUrl + "/api/payments/selcom/webhook";

        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("vendor", appSettingsService.selcomVendor());
        payload.put("order_id", order.getOrderId());
        payload.put("buyer_email", user.getEmail());
        payload.put("buyer_name", user.getFullName() == null ? user.getEmail() : user.getFullName());
        payload.put("buyer_phone", order.getPhone() == null ? "" : order.getPhone());
        payload.put("amount", order.getAmount());
        payload.put("currency", order.getCurrency());
        payload.put("payment_methods", "ALL");
        payload.put("redirect_url", base64(redirect));
        payload.put("cancel_url", base64(cancel));
        payload.put("webhook", base64(webhook));
        payload.put("buyer_remarks", remarks);
        payload.put("merchant_remarks", order.getPurpose());
        payload.put("no_of_items", 1);
        return payload;
    }

    private JsonNode postSelcom(String path, Map<String, Object> payload) throws Exception {
        String apiKey = appSettingsService.selcomApiKey();
        String apiSecret = appSettingsService.selcomApiSecret();
        String baseUrl = appSettingsService.selcomBaseUrl();
        if (apiKey == null || apiSecret == null) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Selcom credentials are not configured");
        }

        String timestamp = ZonedDateTime.now(ZoneId.of("Africa/Dar_es_Salaam")).format(TIMESTAMP);
        String signedFields = String.join(",", payload.keySet());
        String digest = computeDigest(payload, signedFields, timestamp, apiSecret);
        String authorization = Base64.getEncoder().encodeToString(apiKey.getBytes(StandardCharsets.UTF_8));
        String body = objectMapper.writeValueAsString(payload);

        HttpRequest request = HttpRequest.newBuilder()
            .uri(URI.create(baseUrl + path))
            .header("Accept", "application/json")
            .header("Content-Type", "application/json")
            .header("Authorization", "SELCOM " + authorization)
            .header("Digest-Method", "HS256")
            .header("Digest", digest)
            .header("Timestamp", timestamp)
            .header("Signed-Fields", signedFields)
            .POST(HttpRequest.BodyPublishers.ofString(body))
            .build();

        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
        if (response.statusCode() >= 400) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Selcom HTTP " + response.statusCode());
        }
        return objectMapper.readTree(response.body());
    }

    private String computeDigest(Map<String, Object> payload, String signedFields, String timestamp, String apiSecret)
        throws Exception {
        StringBuilder signData = new StringBuilder("timestamp=").append(timestamp);
        for (String field : signedFields.split(",")) {
            Object value = payload.get(field);
            signData.append('&').append(field).append('=').append(value == null ? "" : value);
        }
        Mac mac = Mac.getInstance("HmacSHA256");
        mac.init(new SecretKeySpec(apiSecret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
        byte[] raw = mac.doFinal(signData.toString().getBytes(StandardCharsets.UTF_8));
        return Base64.getEncoder().encodeToString(raw);
    }

    private Map<String, Object> checkoutResponse(PaymentOrder order, boolean mock) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("orderId", order.getOrderId());
        map.put("amount", order.getAmount());
        map.put("currency", order.getCurrency());
        map.put("status", order.getStatus());
        map.put("purpose", order.getPurpose());
        map.put("paymentGatewayUrl", order.getPaymentGatewayUrl());
        map.put("mock", mock);
        map.put("provider", mock ? "mock" : "selcom");
        return map;
    }

    private static String normalizePhone(String phone) {
        if (phone == null) return null;
        String digits = phone.replaceAll("[^0-9+]", "");
        if (digits.startsWith("+")) digits = digits.substring(1);
        if (digits.startsWith("0") && digits.length() == 10) {
            digits = "255" + digits.substring(1);
        }
        return digits.isBlank() ? null : digits;
    }

    private static String base64(String value) {
        return Base64.getEncoder().encodeToString(value.getBytes(StandardCharsets.UTF_8));
    }

    private static String decodeMaybeBase64(String value) {
        if (value == null || value.isBlank()) return value;
        try {
            String decoded = new String(Base64.getDecoder().decode(value), StandardCharsets.UTF_8);
            if (decoded.startsWith("http://") || decoded.startsWith("https://")) {
                return decoded;
            }
        } catch (IllegalArgumentException ignored) {
            // not base64
        }
        return value;
    }

    private static String text(JsonNode node, String field) {
        JsonNode child = node.get(field);
        return child == null || child.isNull() ? null : child.asText();
    }

    private static String stringVal(Object value) {
        return value == null ? null : String.valueOf(value);
    }

    private static String blankToNull(String value) {
        if (value == null) return null;
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    private static String trimSlash(String value) {
        if (value == null) return "";
        return value.endsWith("/") ? value.substring(0, value.length() - 1) : value;
    }
}
