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

    public ScanQuotaService(
        ClientUserRepository clientUserRepository,
        @Value("${app.scan.free-limit:2}") int freeLimit
    ) {
        this.clientUserRepository = clientUserRepository;
        this.freeLimit = Math.max(0, freeLimit);
    }

    public int freeLimit() {
        return freeLimit;
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

    public Map<String, Object> quotaSnapshot(ClientUser user) {
        int used = Math.max(0, user.getAiScanCount());
        boolean subscribed = hasActiveSubscription(user);
        int remaining = subscribed ? Integer.MAX_VALUE : Math.max(0, freeLimit - used);
        boolean canScan = subscribed || used < freeLimit;

        Map<String, Object> map = new LinkedHashMap<>();
        map.put("freeLimit", freeLimit);
        map.put("used", used);
        map.put("remaining", subscribed ? null : remaining);
        map.put("subscribed", subscribed);
        map.put("canScan", canScan);
        map.put("billingPeriod", "monthly");
        map.put("subscribedAt", user.getScanSubscribedAt() == null ? null : user.getScanSubscribedAt().toString());
        map.put("expiresAt", user.getScanSubscriptionExpiresAt() == null ? null : user.getScanSubscriptionExpiresAt().toString());
        map.put("priceTzs", null);
        return map;
    }

    public void assertCanScan(ClientUser user) {
        if (hasActiveSubscription(user)) return;
        if (user.getAiScanCount() < freeLimit) return;
        throw new ResponseStatusException(
            HttpStatus.PAYMENT_REQUIRED,
            "Free AI scans used up. Subscribe monthly to continue scanning cards."
        );
    }

    @Transactional
    public ClientUser recordSuccessfulScan(ClientUser user) {
        ClientUser fresh = clientUserRepository.findById(user.getId())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found."));
        if (!hasActiveSubscription(fresh)) {
            fresh.setAiScanCount(fresh.getAiScanCount() + 1);
            fresh = clientUserRepository.save(fresh);
        }
        return fresh;
    }
}
