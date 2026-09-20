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
    public static final String NFC_CARD_GOLD = "NFC_CARD_GOLD";
    public static final String NFC_CARD_BLACK = "NFC_CARD_BLACK";
    public static final String NFC_CARD_SILVER = "NFC_CARD_SILVER";
    public static final String AI_SCAN = "AI_SCAN_SUBSCRIPTION";

    private final int nfcCardPriceTzs;
    private final int aiScanPriceTzs;
    private final String currency;

    public ProductCatalogService(
        @Value("${app.products.nfc-card.price-tzs:50000}") int nfcCardPriceTzs,
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
            NFC_CARD_GOLD,
            "Kadi Moja Gold",
            "Premium gold-finish NFC card linked to your digital profile.",
            200_000,
            true
        ));
        products.add(product(
            NFC_CARD_BLACK,
            "Kadi Moja Black",
            "Matte black NFC card with your branding.",
            150_000,
            true
        ));
        products.add(product(
            NFC_CARD_SILVER,
            "Kadi Moja Silver",
            "Classic silver NFC card for everyday networking.",
            100_000,
            true
        ));
        products.add(product(
            NFC_CARD,
            "Kadi Moja NFC",
            "Standard PVC NFC card linked to your profile.",
            nfcCardPriceTzs,
            true
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

    public boolean isNfcCardProduct(String code) {
        return code != null && code.startsWith("NFC_CARD");
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
