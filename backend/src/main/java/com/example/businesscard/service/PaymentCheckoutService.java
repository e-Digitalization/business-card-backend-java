package com.example.businesscard.service;

import com.example.businesscard.entity.ClientUser;
import com.example.businesscard.entity.PaymentOrder;
import com.example.businesscard.repository.PaymentOrderRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.Map;

/**
 * Routes checkout to Selcom or NMB based on admin "active payment provider".
 */
@Service
public class PaymentCheckoutService {
    private final AppSettingsService appSettingsService;
    private final SelcomCheckoutService selcomCheckoutService;
    private final NmbCheckoutService nmbCheckoutService;
    private final PaymentOrderRepository paymentOrderRepository;

    public PaymentCheckoutService(
        AppSettingsService appSettingsService,
        SelcomCheckoutService selcomCheckoutService,
        NmbCheckoutService nmbCheckoutService,
        PaymentOrderRepository paymentOrderRepository
    ) {
        this.appSettingsService = appSettingsService;
        this.selcomCheckoutService = selcomCheckoutService;
        this.nmbCheckoutService = nmbCheckoutService;
        this.paymentOrderRepository = paymentOrderRepository;
    }

    public String activeProvider() {
        String provider = appSettingsService.paymentsActiveProvider();
        return "nmb".equals(provider) ? "nmb" : "selcom";
    }

    public Map<String, Object> startAiCheckout(ClientUser user, String phone) {
        if ("nmb".equals(activeProvider())) {
            return nmbCheckoutService.startCheckout(user, phone);
        }
        return selcomCheckoutService.startCheckout(user, phone);
    }

    public Map<String, Object> startNfcCheckout(ClientUser user, String phone, String deliveryNotes) {
        if ("nmb".equals(activeProvider())) {
            return nmbCheckoutService.startNfcCardCheckout(user, phone, deliveryNotes);
        }
        return selcomCheckoutService.startNfcCardCheckout(user, phone, deliveryNotes);
    }

    public Map<String, Object> refreshOrder(ClientUser user, String orderId) {
        PaymentOrder order = paymentOrderRepository.findByOrderId(orderId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Order not found."));
        if ("NMB".equalsIgnoreCase(order.getChannel()) || "NMB".equalsIgnoreCase(order.getPaymentToken())) {
            return nmbCheckoutService.refreshOrderStatus(user, orderId);
        }
        return selcomCheckoutService.refreshOrderStatus(user, orderId);
    }

    public Map<String, Object> completeMockPayment(ClientUser user, String orderId) {
        return selcomCheckoutService.completeMockPayment(user, orderId);
    }

    public int aiScanPriceTzs() {
        return selcomCheckoutService.amountTzs();
    }

    public String currency() {
        return selcomCheckoutService.currency();
    }

    public String statusProviderLabel() {
        String provider = activeProvider();
        if ("nmb".equals(provider)) {
            return "nmb";
        }
        return selcomCheckoutService.isLiveConfigured() ? "selcom" : "mock";
    }
}
