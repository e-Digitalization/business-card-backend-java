package com.example.businesscard.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class ProductCatalogService {
    public static final String NFC_CARD = "NFC_CARD";
    public static final String AI_SCAN = "AI_SCAN_SUBSCRIPTION";

    private final int nfcCardPriceTzs;
    private final int aiScanPriceTzs;
    private final String currency;

    public ProductCatalogService(
        @Value("${app.products.nfc-card.price-tzs:100000}") int nfcCardPriceTzs,
        @Value("${app.selcom.amount-tzs:10000}") int aiScanPriceTzs,
        @Value("${app.selcom.currency:TZS}") String currency
    ) {
        this.nfcCardPriceTzs = nfcCardPriceTzs;
        this.aiScanPriceTzs = aiScanPriceTzs;
        this.currency = currency;
    }

    public List<Map<String, Object>> listProducts() {
        List<Map<String, Object>> products = new ArrayList<>();
        products.add(product(
            NFC_CARD,
            "Kadi Moja NFC Card",
            "Physical PVC NFC card linked to your private profile.",
            nfcCardPriceTzs,
            true
        ));
        products.add(product(
            "NFC_CARD_PRO",
            "Kadi Moja Pro",
            "Custom logo & brand colours — coming soon.",
            75000,
            false
        ));
        products.add(product(
            "NFC_CARD_METAL",
            "Kadi Moja Metal",
            "Premium metal finish — coming soon.",
            145000,
            false
        ));
        products.add(product(
            AI_SCAN,
            "AI Scan Monthly",
            "Unlimited AI business-card scans for 30 days. Renews monthly.",
            aiScanPriceTzs,
            true
        ));
        return products;
    }

    public Map<String, Object> requireActiveProduct(String code) {
        return listProducts().stream()
            .filter(p -> code.equals(p.get("code")) && Boolean.TRUE.equals(p.get("active")))
            .findFirst()
            .orElseThrow(() -> new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "This product is not available yet."
            ));
    }

    public int nfcCardPriceTzs() {
        return nfcCardPriceTzs;
    }

    public String currency() {
        return currency;
    }

    private Map<String, Object> product(String code, String name, String description, int price, boolean active) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("code", code);
        map.put("name", name);
        map.put("description", description);
        map.put("priceTzs", price);
        map.put("currency", currency);
        map.put("active", active);
        return map;
    }
}
