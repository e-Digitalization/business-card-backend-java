package com.example.businesscard.util;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.util.LinkedHashSet;
import java.util.Set;

/** Validates the category list and researcher JSON accepted on card create/update. */
public final class CardProfileValidator {
    // Keep in sync with frontend/src/utils/cardCategories.js
    public static final Set<String> ALLOWED_CATEGORIES = Set.of("researcher", "banker", "government");
    private static final int MAX_RESEARCHER_JSON_CHARS = 200_000;
    private static final ObjectMapper MAPPER = new ObjectMapper();

    private CardProfileValidator() {
    }

    /** Returns a de-duplicated comma-separated list, or null when empty. */
    public static String normalizeCategories(String categories) {
        if (categories == null || categories.isBlank()) {
            return null;
        }
        Set<String> clean = new LinkedHashSet<>();
        for (String raw : categories.split(",")) {
            String id = raw == null ? "" : raw.trim().toLowerCase();
            if (id.isEmpty()) {
                continue;
            }
            if (!ALLOWED_CATEGORIES.contains(id)) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Unknown profile category: " + id);
            }
            clean.add(id);
        }
        return clean.isEmpty() ? null : String.join(",", clean);
    }

    /** Returns the JSON object string, or null when blank. Rejects non-object or oversized JSON. */
    public static String validateResearcherData(String json) {
        return validateJsonObject(json, "Researcher data");
    }

    public static String validateBankerData(String json) {
        return validateJsonObject(json, "Banker data");
    }

    private static String validateJsonObject(String json, String label) {
        if (json == null || json.isBlank()) {
            return null;
        }
        if (json.length() > MAX_RESEARCHER_JSON_CHARS) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, label + " is too large.");
        }
        try {
            JsonNode node = MAPPER.readTree(json);
            if (node == null || !node.isObject()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, label + " must be a JSON object.");
            }
            return MAPPER.writeValueAsString(node);
        } catch (ResponseStatusException e) {
            throw e;
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, label + " is not valid JSON.");
        }
    }
}
