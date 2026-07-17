package com.example.businesscard.service;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.Collections;

@Service
public class GoogleTokenVerifier {
    private final String clientId;
    private final GoogleIdTokenVerifier verifier;

    public GoogleTokenVerifier(@Value("${app.google.client-id:}") String clientId) {
        this.clientId = clientId == null ? "" : clientId.trim();
        if (this.clientId.isEmpty()) {
            this.verifier = null;
        } else {
            this.verifier = new GoogleIdTokenVerifier.Builder(new NetHttpTransport(), GsonFactory.getDefaultInstance())
                .setAudience(Collections.singletonList(this.clientId))
                .build();
        }
    }

    public boolean isConfigured() {
        return verifier != null;
    }

    public GoogleProfile verify(String idToken) {
        if (verifier == null) {
            throw new IllegalStateException("Google Sign-In is not configured. Set app.google.client-id.");
        }
        try {
            GoogleIdToken token = verifier.verify(idToken);
            if (token == null) {
                throw new IllegalArgumentException("Invalid Google ID token.");
            }
            GoogleIdToken.Payload payload = token.getPayload();
            String email = payload.getEmail();
            if (email == null || email.isBlank()) {
                throw new IllegalArgumentException("Google account has no email.");
            }
            Boolean verified = payload.getEmailVerified();
            if (verified != null && !verified) {
                throw new IllegalArgumentException("Google email is not verified.");
            }
            return new GoogleProfile(
                payload.getSubject(),
                email,
                (String) payload.get("name"),
                (String) payload.get("picture")
            );
        } catch (IllegalArgumentException | IllegalStateException ex) {
            throw ex;
        } catch (Exception ex) {
            throw new IllegalArgumentException("Could not verify Google ID token.");
        }
    }

    public record GoogleProfile(String sub, String email, String name, String pictureUrl) {}
}
