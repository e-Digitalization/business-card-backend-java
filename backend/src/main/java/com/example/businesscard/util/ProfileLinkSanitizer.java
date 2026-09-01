package com.example.businesscard.util;

import java.net.URI;
import java.util.Locale;

public final class ProfileLinkSanitizer {
    private ProfileLinkSanitizer() {
    }

    public static String sanitize(String value, String photoUrl) {
        if (value == null || value.isBlank()) {
            return value;
        }

        String clean = value.trim();
        if (photoUrl != null && clean.equalsIgnoreCase(photoUrl.trim())) {
            return null;
        }

        if (looksLikeImageUrl(clean)) {
            return null;
        }

        return clean;
    }

    private static boolean looksLikeImageUrl(String value) {
        try {
            URI uri = URI.create(value);
            String host = uri.getHost();
            String path = uri.getPath() == null ? "" : uri.getPath().toLowerCase(Locale.ROOT);
            return (host != null && host.toLowerCase(Locale.ROOT).endsWith("googleusercontent.com"))
                || path.matches(".*\\.(?:avif|gif|jpe?g|png|webp)(?:/.*)?$");
        } catch (IllegalArgumentException ignored) {
            return false;
        }
    }
}
