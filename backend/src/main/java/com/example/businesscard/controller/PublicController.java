package com.example.businesscard.controller;

import com.example.businesscard.entity.Card;
import com.example.businesscard.repository.CardRepository;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

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
        appendPhones(vcard, card.getPhone());
        vcard.append("EMAIL:").append(value(card.getEmail())).append("\n");
        vcard.append("ORG:").append(value(card.getCompany())).append("\n");
        vcard.append("TITLE:").append(value(card.getTitle())).append("\n");
        vcard.append("URL:").append(value(card.getWebsite())).append("\n");
        vcard.append("END:VCARD\n");

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType("text/vcard"));
        headers.set(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=contact.vcf");

        return new ResponseEntity<>(vcard.toString(), headers, HttpStatus.OK);
    }

    private String value(String input) {
        return input == null ? "" : input.replace("\n", " ");
    }

    private void appendPhones(StringBuilder vcard, String phones) {
        if (phones == null || phones.isBlank()) {
            vcard.append("TEL:\n");
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
