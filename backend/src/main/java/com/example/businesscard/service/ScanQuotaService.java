package com.example.businesscard.service;

import com.example.businesscard.entity.ClientUser;
import com.example.businesscard.repository.ClientUserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;

@Service
public class ScanQuotaService {
    private final ClientUserRepository clientUserRepository;
    private final int freeLimit;
    private final int monthlyLimit;

    public ScanQuotaService(
        ClientUserRepository clientUserRepository,
        @Value("${app.scan.free-limit:2}") int freeLimit,
        @Value("${app.scan.monthly-limit:20}") int monthlyLimit
    ) {
        this.clientUserRepository = clientUserRepository;
        this.freeLimit = Math.max(0, freeLimit);
        this.monthlyLimit = Math.max(0, monthlyLimit);
    }

    public int freeLimit() {
        return freeLimit;
    }

    public int monthlyLimit() {
        return monthlyLimit;
    }

    public boolean hasActiveSubscription(ClientUser user) {
        if (user == null || !user.isScanSubscribed()) return false;
        Instant expires = user.getScanSubscriptionExpiresAt();
        if (expires == null) {
            // Legacy one-time unlock: treat as active until we set an expiry on renew.
            return true;
        }
        return expires.isAfter(Instant.now());
    }

    /** Scans still available in the current subscription month (0 when the cap is hit). */
    public int subscriptionRemaining(ClientUser user) {
        return Math.max(0, monthlyLimit - Math.max(0, user.getScanSubscriptionUsed()));
    }

    public Map<String, Object> quotaSnapshot(ClientUser user) {
        int used = Math.max(0, user.getAiScanCount());
        boolean subscribed = hasActiveSubscription(user);
        int monthlyUsed = Math.max(0, user.getScanSubscriptionUsed());
        int remaining = subscribed
            ? subscriptionRemaining(user)
            : Math.max(0, freeLimit - used);
        boolean canScan = subscribed ? remaining > 0 : used < freeLimit;

        Map<String, Object> map = new LinkedHashMap<>();
        map.put("freeLimit", freeLimit);
        map.put("monthlyLimit", monthlyLimit);
        map.put("used", used);
        map.put("monthlyUsed", subscribed ? monthlyUsed : null);
        map.put("remaining", remaining);
        map.put("subscribed", subscribed);
        map.put("canScan", canScan);
        map.put("billingPeriod", "monthly");
        map.put("subscribedAt", user.getScanSubscribedAt() == null ? null : user.getScanSubscribedAt().toString());
        map.put("expiresAt", user.getScanSubscriptionExpiresAt() == null ? null : user.getScanSubscriptionExpiresAt().toString());
        map.put("priceTzs", null);
        return map;
    }

    public void assertCanScan(ClientUser user) {
        if (hasActiveSubscription(user)) {
            if (subscriptionRemaining(user) > 0) return;
            throw new ResponseStatusException(
                HttpStatus.PAYMENT_REQUIRED,
                "You've used all " + monthlyLimit + " AI scans for this month. Your allowance resets when the subscription renews."
            );
        }
        if (user.getAiScanCount() < freeLimit) return;
        throw new ResponseStatusException(
            HttpStatus.PAYMENT_REQUIRED,
            "Free AI scans used up. Subscribe monthly to scan up to " + monthlyLimit + " cards a month."
        );
    }

    @Transactional
    public ClientUser recordSuccessfulScan(ClientUser user) {
        ClientUser fresh = clientUserRepository.findById(user.getId())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found."));
        if (hasActiveSubscription(fresh)) {
            fresh.setScanSubscriptionUsed(Math.max(0, fresh.getScanSubscriptionUsed()) + 1);
        } else {
            fresh.setAiScanCount(fresh.getAiScanCount() + 1);
        }
        return clientUserRepository.save(fresh);
    }
}
