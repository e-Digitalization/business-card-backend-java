package com.example.businesscard.controller;

import com.example.businesscard.entity.Card;
import com.example.businesscard.repository.CardRepository;
import com.example.businesscard.util.ProfileLinkSanitizer;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.Arrays;

@RestController
@RequestMapping("/api/public")
public class PublicController {
    private final CardRepository cardRepository;

    public PublicController(CardRepository cardRepository) {
        this.cardRepository = cardRepository;
    }

    @GetMapping("/profile/{slug}")
    public ResponseEntity<Card> getProfile(@PathVariable String slug) {
        return cardRepository.findBySlugAndActiveTrue(slug)
            .map(ResponseEntity::ok)
            .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/profile/{slug}/vcard")
    public ResponseEntity<String> downloadVCard(@PathVariable String slug) {
        Card card = cardRepository.findBySlugAndActiveTrue(slug)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Card not found"));

        StringBuilder vcard = new StringBuilder();
        vcard.append("BEGIN:VCARD\n");
        vcard.append("VERSION:3.0\n");
        vcard.append("FN:").append(value(card.getFullName())).append("\n");
        vcard.append("N:").append(structuredName(card.getFullName())).append("\n");
        appendPhones(vcard, card.getPhone());
        appendIfPresent(vcard, "EMAIL", card.getEmail());
        appendIfPresent(vcard, "ORG", card.getCompany());
        appendIfPresent(vcard, "TITLE", card.getTitle());
        appendIfPresent(vcard, "URL", ProfileLinkSanitizer.sanitize(card.getWebsite(), card.getPhotoUrl()));
        appendIfPresent(vcard, "URL;TYPE=LinkedIn", ProfileLinkSanitizer.sanitize(card.getLinkedin(), card.getPhotoUrl()));
        appendIfPresent(vcard, "URL;TYPE=Twitter", ProfileLinkSanitizer.sanitize(card.getTwitter(), card.getPhotoUrl()));
        appendIfPresent(vcard, "URL;TYPE=GitHub", ProfileLinkSanitizer.sanitize(card.getGithub(), card.getPhotoUrl()));
        appendIfPresent(vcard, "URL;TYPE=Instagram", ProfileLinkSanitizer.sanitize(card.getInstagram(), card.getPhotoUrl()));
        vcard.append("END:VCARD\n");

        String fileName = safeFileName(card.getFullName());
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType("text/vcard"));
        // "inline" (not "attachment") lets Safari/Chrome offer "Add to Contacts"
        // directly when this URL is opened as a normal link, instead of routing
        // through the browser's file-download flow.
        headers.set(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=" + fileName + ".vcf");
        headers.setCacheControl("no-store, no-cache, must-revalidate");

        return new ResponseEntity<>(vcard.toString(), headers, HttpStatus.OK);
    }

    private String value(String input) {
        return input == null ? "" : input.replace("\n", " ");
    }

    private void appendIfPresent(StringBuilder vcard, String property, String rawValue) {
        if (rawValue != null && !rawValue.isBlank()) {
            vcard.append(property).append(':').append(value(rawValue)).append("\n");
        }
    }

    // vCard's N (structured name) drives how address books split first/last —
    // FN alone leaves that ambiguous and some clients import the whole name as one field.
    private String structuredName(String fullName) {
        if (fullName == null || fullName.isBlank()) {
            return ";;;;";
        }
        String[] parts = fullName.trim().split("\\s+");
        if (parts.length == 1) {
            return value(parts[0]) + ";;;;";
        }
        String family = parts[parts.length - 1];
        String given = String.join(" ", Arrays.copyOfRange(parts, 0, parts.length - 1));
        return value(family) + ";" + value(given) + ";;;";
    }

    private String safeFileName(String name) {
        if (name == null || name.isBlank()) {
            return "contact";
        }
        String cleaned = name.trim().replaceAll("[^A-Za-z0-9._-]+", "-");
        return cleaned.isBlank() ? "contact" : cleaned;
    }

    private void appendPhones(StringBuilder vcard, String phones) {
        if (phones == null || phones.isBlank()) {
            return;
        }
        String[] values = phones.split("[,;]");
        for (String raw : values) {
            String trimmed = raw.trim();
            if (!trimmed.isEmpty()) {
                vcard.append("TEL:").append(value(trimmed)).append("\n");
            }
        }
    }
}
