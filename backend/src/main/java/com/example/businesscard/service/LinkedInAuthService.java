package com.example.businesscard.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;

/** Sign In with LinkedIn using OpenID Connect: authorization code -> access token -> /v2/userinfo. */
@Service
public class LinkedInAuthService {
    private static final String TOKEN_URL = "https://www.linkedin.com/oauth/v2/accessToken";
    private static final String USERINFO_URL = "https://api.linkedin.com/v2/userinfo";

    private final String clientId;
    private final String clientSecret;
    private final ObjectMapper mapper = new ObjectMapper();
    private final HttpClient http = HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(10)).build();

    public LinkedInAuthService(@Value("${app.linkedin.client-id:}") String clientId,
                               @Value("${app.linkedin.client-secret:}") String clientSecret) {
        this.clientId = clientId == null ? "" : clientId.trim();
        this.clientSecret = clientSecret == null ? "" : clientSecret.trim();
    }

    public boolean isConfigured() {
        return !clientId.isBlank() && !clientSecret.isBlank();
    }

    public String clientId() {
        return clientId;
    }

    public LinkedInProfile exchange(String code, String redirectUri) {
        if (!isConfigured()) {
            throw new IllegalStateException("LinkedIn Sign-In is not configured. Set LINKEDIN_CLIENT_ID and LINKEDIN_CLIENT_SECRET.");
        }
        try {
            String form = "grant_type=authorization_code"
                + "&code=" + enc(code)
                + "&redirect_uri=" + enc(redirectUri)
                + "&client_id=" + enc(clientId)
                + "&client_secret=" + enc(clientSecret);
            HttpResponse<String> tokenRes = http.send(
                HttpRequest.newBuilder(URI.create(TOKEN_URL))
                    .header("Content-Type", "application/x-www-form-urlencoded")
                    .POST(HttpRequest.BodyPublishers.ofString(form))
                    .build(),
                HttpResponse.BodyHandlers.ofString());
            if (tokenRes.statusCode() != 200) {
                throw new IllegalArgumentException("LinkedIn rejected the sign-in code. Please try again.");
            }
            String accessToken = mapper.readTree(tokenRes.body()).path("access_token").asText("");
            if (accessToken.isBlank()) {
                throw new IllegalArgumentException("LinkedIn did not return an access token.");
            }

            HttpResponse<String> infoRes = http.send(
                HttpRequest.newBuilder(URI.create(USERINFO_URL))
                    .header("Authorization", "Bearer " + accessToken)
                    .GET()
                    .build(),
                HttpResponse.BodyHandlers.ofString());
            if (infoRes.statusCode() != 200) {
                throw new IllegalArgumentException("Could not read your LinkedIn profile.");
            }
            JsonNode info = mapper.readTree(infoRes.body());
            String sub = info.path("sub").asText("");
            String email = info.path("email").asText("");
            if (sub.isBlank() || email.isBlank()) {
                throw new IllegalArgumentException("Your LinkedIn account has no email address.");
            }
            if (info.has("email_verified") && !info.path("email_verified").asBoolean(false)) {
                throw new IllegalArgumentException("Your LinkedIn email is not verified.");
            }
            String name = info.path("name").asText("");
            String picture = info.path("picture").asText("");
            return new LinkedInProfile(sub, email, name.isBlank() ? null : name, picture.isBlank() ? null : picture);
        } catch (IOException ex) {
            throw new IllegalArgumentException("Could not reach LinkedIn. Please try again.");
        } catch (InterruptedException ex) {
            Thread.currentThread().interrupt();
            throw new IllegalArgumentException("LinkedIn sign-in was interrupted.");
        }
    }

    private static String enc(String value) {
        return URLEncoder.encode(value == null ? "" : value, StandardCharsets.UTF_8);
    }

    public record LinkedInProfile(String sub, String email, String name, String pictureUrl) {}
}
