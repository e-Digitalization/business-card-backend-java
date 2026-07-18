package com.example.businesscard.service;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import org.springframework.stereotype.Service;

import java.util.Collections;

@Service
public class GoogleTokenVerifier {
    private final AppSettingsService appSettingsService;

    public GoogleTokenVerifier(AppSettingsService appSettingsService) {
        this.appSettingsService = appSettingsService;
    }

    public boolean isConfigured() {
        String clientId = appSettingsService.googleClientId();
        return clientId != null && !clientId.isBlank();
    }

    public String clientId() {
        return appSettingsService.googleClientId();
    }

    public GoogleProfile verify(String idToken) {
        String clientId = appSettingsService.googleClientId();
        if (clientId == null || clientId.isBlank()) {
            throw new IllegalStateException("Google Sign-In is not configured. Set Google Client ID in Admin → Setups.");
        }
        GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(
            new NetHttpTransport(),
            GsonFactory.getDefaultInstance()
        )
            .setAudience(Collections.singletonList(clientId))
            .build();
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
