package com.example.businesscard.service;

import com.example.businesscard.repository.CardRepository;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;

@Service
public class PrivateSlugService {
    private static final String ALPHABET = "23456789abcdefghjkmnpqrstuvwxyz";
    private static final SecureRandom RANDOM = new SecureRandom();

    private final CardRepository cardRepository;

    public PrivateSlugService(CardRepository cardRepository) {
        this.cardRepository = cardRepository;
    }

    public String nextUnique() {
        for (int attempt = 0; attempt < 40; attempt++) {
            String candidate = "k" + randomToken(10);
            if (cardRepository.findBySlug(candidate).isEmpty()) {
                return candidate;
            }
        }
        return "k" + Long.toString(System.currentTimeMillis(), 36);
    }

    /** True when the public path could be guessed from a person's name. */
    public boolean isGuessable(String slug) {
        if (slug == null || slug.isBlank()) {
            return true;
        }
        return !slug.trim().toLowerCase().matches("^k[a-z0-9]{8,14}$");
    }

    private String randomToken(int length) {
        StringBuilder sb = new StringBuilder(length);
        for (int i = 0; i < length; i++) {
            sb.append(ALPHABET.charAt(RANDOM.nextInt(ALPHABET.length())));
        }
        return sb.toString();
    }
}
