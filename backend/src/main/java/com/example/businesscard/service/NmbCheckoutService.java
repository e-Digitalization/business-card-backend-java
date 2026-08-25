package com.example.businesscard.service;

import com.example.businesscard.entity.ClientUser;
import com.example.businesscard.entity.NfcCardRequest;
import com.example.businesscard.entity.PaymentOrder;
import com.example.businesscard.repository.NfcCardRequestRepository;
import com.example.businesscard.repository.PaymentOrderRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicReference;

@Service
public class NmbCheckoutService {
    private final PaymentOrderRepository paymentOrderRepository;
    private final NfcCardRequestRepository nfcCardRequestRepository;
    private final ProductCatalogService productCatalogService;
    private final ScanQuotaService scanQuotaService;
    private final AppSettingsService appSettingsService;
    private final SelcomCheckoutService selcomCheckoutService;
    private final ObjectMapper objectMapper;
    private final HttpClient httpClient = HttpClient.newHttpClient();
    private final String frontendBaseUrl;

    private final AtomicReference<CachedToken> tokenCache = new AtomicReference<>();

    public NmbCheckoutService(
        PaymentOrderRepository paymentOrderRepository,
        NfcCardRequestRepository nfcCardRequestRepository,
        ProductCatalogService productCatalogService,
        ScanQuotaService scanQuotaService,
        AppSettingsService appSettingsService,
        SelcomCheckoutService selcomCheckoutService,
        ObjectMapper objectMapper,
        @Value("${app.frontend.base-url:http://localhost:5173}") String frontendBaseUrl
    ) {
        this.paymentOrderRepository = paymentOrderRepository;
        this.nfcCardRequestRepository = nfcCardRequestRepository;
        this.productCatalogService = productCatalogService;
        this.scanQuotaService = scanQuotaService;
        this.appSettingsService = appSettingsService;
        this.selcomCheckoutService = selcomCheckoutService;
        this.objectMapper = objectMapper;
        this.frontendBaseUrl = trimSlash(frontendBaseUrl);
    }

    public boolean isLiveConfigured() {
        // Credentials in Setups (or .env) mean live NMB — no silent mock fallback.
        return appSettingsService.nmbConfigured();
    }

    @Transactional
    public Map<String, Object> startCheckout(ClientUser user, String phone) {
        if (scanQuotaService.hasActiveSubscription(user)) {
            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "Your AI scan monthly subscription is still active."
            );
        }
        return createControlNumberOrder(
            user,
            phone,
            ProductCatalogService.AI_SCAN,
            appSettingsService.selcomAmountTzs(),
            "AI Scan monthly subscription",
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
        request.setCurrency(appSettingsService.selcomCurrency());
        request.setStatus("PENDING_PAYMENT");
        request.setPhone(normalizePhone(phone));
        request.setDeliveryNotes(deliveryNotes == null ? null : deliveryNotes.trim());
        request = nfcCardRequestRepository.save(request);

        Map<String, Object> checkout = createControlNumberOrder(
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
        return checkout;
    }

    @Transactional
    public Map<String, Object> refreshOrderStatus(ClientUser user, String orderId) {
        PaymentOrder order = paymentOrderRepository.findByOrderId(orderId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Order not found."));
        if (!order.getOwner().getId().equals(user.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Order does not belong to this account.");
        }

        if (!"PAID".equalsIgnoreCase(order.getStatus())
            && order.getSelcomReference() != null
            && isLiveConfigured()
            && "NMB".equalsIgnoreCase(order.getChannel())) {
            try {
                JsonNode payment = getPayment(order.getSelcomReference());
                if (isPaid(payment)) {
                    selcomCheckoutService.markPaid(
                        order,
                        order.getSelcomReference(),
                        "NMB",
                        text(payment, "payerMobile", "phone", "msisdn")
                    );
                    order = paymentOrderRepository.findByOrderId(orderId).orElse(order);
                }
            } catch (Exception ex) {
                // Keep pending if NMB lookup fails; surface status to client.
            }
        }

        Map<String, Object> map = new LinkedHashMap<>();
        map.put("orderId", order.getOrderId());
        map.put("status", order.getStatus());
        map.put("purpose", order.getPurpose());
        map.put("provider", "nmb");
        map.put("controlNumber", order.getSelcomReference());
        map.put("referenceNumber", order.getSelcomReference());
        map.put("amount", order.getAmount());
        map.put("currency", order.getCurrency());
        map.put("subscribed", scanQuotaService.hasActiveSubscription(user));
        map.put("nfcRequestId", order.getNfcRequestId());
        return map;
    }

    private Map<String, Object> createControlNumberOrder(
        ClientUser user,
        String phone,
        String purpose,
        int amount,
        String paymentDesc,
        String returnPath,
        Long nfcRequestId
    ) {
        String orderId = "KM" + System.currentTimeMillis() + UUID.randomUUID().toString().substring(0, 6).toUpperCase();
        PaymentOrder order = new PaymentOrder();
        order.setOwner(user);
        order.setOrderId(orderId);
        order.setAmount(amount);
        order.setCurrency(appSettingsService.selcomCurrency());
        order.setPurpose(purpose);
        order.setStatus("PENDING");
        order.setPhone(normalizePhone(phone));
        order.setNfcRequestId(nfcRequestId);
        order.setChannel("NMB");
        order.setPaymentToken("NMB");

        if (!isLiveConfigured()) {
            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "NMB credentials are incomplete. Set client username, client key, and system name in Admin → Setups → NMB."
            );
        }

        try {
            JsonNode generated = generateControlNumber(user, order, paymentDesc);
            String reference = text(generated, "reference_number", "referenceNumber", "controlNumber");
            String status = text(generated, "status");
            if (reference == null || reference.isBlank()) {
                throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "NMB did not return a control number.");
            }
            if (status != null && !status.equalsIgnoreCase("Success") && !status.equalsIgnoreCase("SUCCESS")) {
                throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "NMB generatectlno failed: " + status);
            }
            order.setSelcomReference(reference);
            order.setPaymentGatewayUrl(frontendBaseUrl + returnPath + "?pay=nmb&order=" + orderId);
            paymentOrderRepository.save(order);
            return checkoutResponse(order, false);
        } catch (ResponseStatusException ex) {
            throw ex;
        } catch (Exception ex) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Could not start NMB payment: " + ex.getMessage());
        }
    }

    private JsonNode generateControlNumber(ClientUser user, PaymentOrder order, String paymentDesc) throws Exception {
        String[] names = splitName(user.getFullName(), user.getEmail());
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("payerID", "KM" + user.getId());
        body.put("firstName", names[0]);
        body.put("lastName", names[1]);
        body.put("email", user.getEmail());
        body.put("payerMobile", order.getPhone() == null ? "255700000000" : order.getPhone());
        body.put("currency", order.getCurrency());
        body.put("paymentType", paymentDesc);
        body.put("amount", order.getAmount());
        body.put("amountType", "EXACT");
        body.put("paymentDesc", paymentDesc + " · " + order.getOrderId());
        body.put("systemName", appSettingsService.nmbSystemName());
        return postJson("/api/v1/generatectlno", body, true);
    }

    private JsonNode getPayment(String paymentReference) throws Exception {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("paymentReference", paymentReference);
        return postJson("/api/v1/getpayment", body, true);
    }

    private String login() throws Exception {
        CachedToken cached = tokenCache.get();
        if (cached != null && cached.expiresAt.isAfter(Instant.now().plusSeconds(30))) {
            return cached.token;
        }

        Map<String, Object> body = new LinkedHashMap<>();
        body.put("client_usr", appSettingsService.nmbClientUsr());
        body.put("client_key", appSettingsService.nmbClientKey());
        JsonNode response = postJson("/api/v1/login", body, false);
        String token = text(response, "token", "access_token", "accessToken");
        if (token == null || token.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "NMB login did not return a token.");
        }
        tokenCache.set(new CachedToken(token, Instant.now().plusSeconds(50 * 60)));
        return token;
    }

    private JsonNode postJson(String path, Map<String, Object> body, boolean auth) throws Exception {
        String json = objectMapper.writeValueAsString(body);
        HttpRequest.Builder builder = HttpRequest.newBuilder()
            .uri(URI.create(appSettingsService.nmbBaseUrl() + path))
            .header("Accept", "application/json")
            .header("Content-Type", "application/json")
            .POST(HttpRequest.BodyPublishers.ofString(json, StandardCharsets.UTF_8));

        if (auth) {
            builder.header("Authorization", "Bearer " + login());
        }

        HttpResponse<String> response = httpClient.send(builder.build(), HttpResponse.BodyHandlers.ofString());
        if (response.statusCode() == 401 && auth) {
            tokenCache.set(null);
            builder = HttpRequest.newBuilder()
                .uri(URI.create(appSettingsService.nmbBaseUrl() + path))
                .header("Accept", "application/json")
                .header("Content-Type", "application/json")
                .header("Authorization", "Bearer " + login())
                .POST(HttpRequest.BodyPublishers.ofString(json, StandardCharsets.UTF_8));
            response = httpClient.send(builder.build(), HttpResponse.BodyHandlers.ofString());
        }
        if (response.statusCode() >= 400) {
            throw new ResponseStatusException(
                HttpStatus.BAD_GATEWAY,
                "NMB HTTP " + response.statusCode() + ": " + truncate(response.body())
            );
        }
        if (response.body() == null || response.body().isBlank()) {
            return objectMapper.createObjectNode();
        }
        return objectMapper.readTree(response.body());
    }

    private Map<String, Object> checkoutResponse(PaymentOrder order, boolean mock) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("orderId", order.getOrderId());
        map.put("amount", order.getAmount());
        map.put("currency", order.getCurrency());
        map.put("status", order.getStatus());
        map.put("purpose", order.getPurpose());
        map.put("provider", "nmb");
        map.put("mock", mock);
        map.put("controlNumber", order.getSelcomReference());
        map.put("referenceNumber", order.getSelcomReference());
        map.put("paymentGatewayUrl", order.getPaymentGatewayUrl());
        map.put(
            "instructions",
            "Pay with NMB using control number " + order.getSelcomReference()
                + ". After paying, return here and we will confirm the payment."
        );
        return map;
    }

    private static boolean isPaid(JsonNode payment) {
        if (payment == null || payment.isNull()) return false;
        String status = text(payment, "status", "paymentStatus", "payment_status", "result");
        if (status != null) {
            String s = status.trim().toLowerCase();
            if (s.contains("success") || s.contains("paid") || s.contains("complete") || s.equals("000")) {
                return true;
            }
        }
        if (payment.path("paid").asBoolean(false) || payment.path("isPaid").asBoolean(false)) {
            return true;
        }
        JsonNode amountPaid = payment.get("amountPaid");
        if (amountPaid == null) amountPaid = payment.get("paidAmount");
        return amountPaid != null && amountPaid.isNumber() && amountPaid.asDouble() > 0;
    }

    private static String[] splitName(String fullName, String email) {
        String raw = fullName == null || fullName.isBlank()
            ? (email == null ? "Customer User" : email.split("@")[0].replace('.', ' '))
            : fullName.trim();
        String[] parts = raw.split("\\s+");
        String first = parts[0];
        String last = parts.length > 1 ? parts[parts.length - 1] : "Customer";
        return new String[]{first, last};
    }

    private static String text(JsonNode node, String... fields) {
        if (node == null) return null;
        for (String field : fields) {
            JsonNode value = node.get(field);
            if (value != null && !value.isNull() && !value.asText().isBlank()) {
                return value.asText().trim();
            }
        }
        return null;
    }

    private static String normalizePhone(String phone) {
        if (phone == null || phone.isBlank()) return null;
        String digits = phone.replaceAll("[^0-9]", "");
        if (digits.startsWith("0") && digits.length() == 10) {
            return "255" + digits.substring(1);
        }
        if (digits.startsWith("255")) return digits;
        return digits;
    }

    private static String trimSlash(String value) {
        if (value == null) return "";
        String v = value.trim();
        while (v.endsWith("/")) v = v.substring(0, v.length() - 1);
        return v;
    }

    private static String truncate(String value) {
        if (value == null) return "";
        return value.length() > 180 ? value.substring(0, 180) + "…" : value;
    }

    private record CachedToken(String token, Instant expiresAt) {}
}
