package com.example.businesscard.dto;

import com.example.businesscard.entity.Card;

import java.util.HashMap;
import java.util.Map;

public class ClientAuthResponse {
    private String token;
    private Map<String, Object> user;
    private Card card;

    public ClientAuthResponse(String token, Long id, String email, String fullName, String pictureUrl, Card card) {
        this.token = token;
        this.user = new HashMap<>();
        this.user.put("id", id);
        this.user.put("email", email);
        this.user.put("fullName", fullName);
        this.user.put("pictureUrl", pictureUrl);
        this.card = card;
    }

    public String getToken() {
        return token;
    }

    public Map<String, Object> getUser() {
        return user;
    }

    public Card getCard() {
        return card;
    }
}
