package com.example.businesscard.service;

import com.example.businesscard.dto.CardScanResult;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.Base64;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;

@Service
public class AiCardScanService {
    private static final Set<String> ALLOWED = Set.of(
        "image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"
    );
    private static final String PROMPT = """
        Extract contact details from this business card photo.
        The card may be rotated or sideways — still read all text.
        Return ONLY valid JSON with these keys (use empty string if unknown):
        fullName, title, company, phone, email, website, location, whatsapp, notes.
        Prefer international phone format when country is clear (e.g. +255…).
        Put extra useful text (ministry, address, qualifications) into notes.
        """;

    private final ObjectMapper objectMapper;
    private final AppSettingsService appSettingsService;
    private final HttpClient httpClient = HttpClient.newBuilder()
        .connectTimeout(Duration.ofSeconds(20))
        .build();

    public AiCardScanService(ObjectMapper objectMapper, AppSettingsService appSettingsService) {
        this.objectMapper = objectMapper;
        this.appSettingsService = appSettingsService;
    }

    public boolean isEnabled() {
        return appSettingsService.openaiApiKey() != null || appSettingsService.geminiApiKey() != null;
    }

    public String activeProvider() {
        if (appSettingsService.openaiApiKey() != null) return "openai";
        if (appSettingsService.geminiApiKey() != null) return "gemini";
        return "none";
    }

    public CardScanResult scan(MultipartFile file) {
        String openaiKey = appSettingsService.openaiApiKey();
        String geminiKey = appSettingsService.geminiApiKey();
        if (openaiKey == null && geminiKey == null) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,
                "AI card scan is not configured. Set OpenAI or Gemini in Admin → Setups.");
        }
        if (file == null || file.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Choose a photo to scan.");
        }
        String contentType = file.getContentType() == null ? "" : file.getContentType().toLowerCase(Locale.ROOT);
        if (!ALLOWED.contains(contentType)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Use a JPG, PNG, WebP, or GIF image.");
        }

        try {
            byte[] bytes = file.getBytes();
            if (bytes.length > 5 * 1024 * 1024) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Photo must be under 5 MB.");
            }
            String base64 = Base64.getEncoder().encodeToString(bytes);
            String mime = contentType.equals("image/jpg") ? "image/jpeg" : contentType;

            CardScanResult result = openaiKey != null
                ? scanWithOpenAi(openaiKey, appSettingsService.openaiModel(), base64, mime)
                : scanWithGemini(geminiKey, appSettingsService.geminiModel(), base64, mime);
            result.setProvider(activeProvider());
            return result;
        } catch (ResponseStatusException ex) {
            throw ex;
        } catch (Exception ex) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY,
                "AI could not read this card. Try again or enter details manually.");
        }
    }

    private CardScanResult scanWithOpenAi(String openaiKey, String openaiModel, String base64, String mime) throws Exception {
        Map<String, Object> payload = Map.of(
            "model", openaiModel,
            "temperature", 0,
            "messages", List.of(Map.of(
                "role", "user",
                "content", List.of(
                    Map.of("type", "text", "text", PROMPT),
                    Map.of(
                        "type", "image_url",
                        "image_url", Map.of("url", "data:" + mime + ";base64," + base64)
                    )
                )
            ))
        );

        HttpRequest request = HttpRequest.newBuilder()
            .uri(URI.create("https://api.openai.com/v1/chat/completions"))
            .timeout(Duration.ofSeconds(60))
            .header("Authorization", "Bearer " + openaiKey)
            .header("Content-Type", "application/json")
            .POST(HttpRequest.BodyPublishers.ofString(objectMapper.writeValueAsString(payload)))
            .build();

        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
        if (response.statusCode() >= 400) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "OpenAI scan failed (" + response.statusCode() + ").");
        }
        JsonNode root = objectMapper.readTree(response.body());
        String content = root.path("choices").path(0).path("message").path("content").asText("");
        return parseJsonContent(content);
    }

    private CardScanResult scanWithGemini(String geminiKey, String geminiModel, String base64, String mime) throws Exception {
        String url = "https://generativelanguage.googleapis.com/v1beta/models/"
            + geminiModel + ":generateContent?key=" + geminiKey;

        Map<String, Object> payload = Map.of(
            "contents", List.of(Map.of(
                "parts", List.of(
                    Map.of("text", PROMPT),
                    Map.of("inline_data", Map.of("mime_type", mime, "data", base64))
                )
            ))
        );

        HttpRequest request = HttpRequest.newBuilder()
            .uri(URI.create(url))
            .timeout(Duration.ofSeconds(60))
            .header("Content-Type", "application/json")
            .POST(HttpRequest.BodyPublishers.ofString(objectMapper.writeValueAsString(payload)))
            .build();

        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
        if (response.statusCode() >= 400) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Gemini scan failed (" + response.statusCode() + ").");
        }
        JsonNode root = objectMapper.readTree(response.body());
        String content = root.path("candidates").path(0).path("content").path("parts").path(0).path("text").asText("");
        return parseJsonContent(content);
    }

    private CardScanResult parseJsonContent(String content) throws Exception {
        String json = content.trim();
        if (json.startsWith("```")) {
            json = json.replaceFirst("^```(?:json)?\\s*", "").replaceFirst("\\s*```$", "");
        }
        int start = json.indexOf('{');
        int end = json.lastIndexOf('}');
        if (start >= 0 && end > start) {
            json = json.substring(start, end + 1);
        }
        JsonNode node = objectMapper.readTree(json);
        CardScanResult result = new CardScanResult();
        result.setFullName(text(node, "fullName"));
        result.setTitle(text(node, "title"));
        result.setCompany(text(node, "company"));
        result.setPhone(text(node, "phone"));
        result.setEmail(text(node, "email"));
        result.setWebsite(text(node, "website"));
        result.setLocation(text(node, "location"));
        result.setWhatsapp(text(node, "whatsapp"));
        result.setNotes(text(node, "notes"));
        result.setRawText(json);
        return result;
    }

    private static String text(JsonNode node, String field) {
        JsonNode value = node.get(field);
        return value == null || value.isNull() ? "" : value.asText("");
    }
}
