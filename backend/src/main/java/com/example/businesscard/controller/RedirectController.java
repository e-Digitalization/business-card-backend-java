package com.example.businesscard.controller;

import com.example.businesscard.entity.Card;
import com.example.businesscard.entity.CardTag;
import com.example.businesscard.entity.TapLog;
import com.example.businesscard.repository.CardTagRepository;
import com.example.businesscard.repository.TapLogRepository;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;

@RestController
public class RedirectController {
    private final CardTagRepository cardTagRepository;
    private final TapLogRepository tapLogRepository;
    private final String frontendBaseUrl;

    public RedirectController(
            CardTagRepository cardTagRepository,
            TapLogRepository tapLogRepository,
            @Value("${app.frontend.base-url:http://localhost:5173}") String frontendBaseUrl
    ) {
        this.cardTagRepository = cardTagRepository;
        this.tapLogRepository = tapLogRepository;
        this.frontendBaseUrl = frontendBaseUrl.endsWith("/")
                ? frontendBaseUrl.substring(0, frontendBaseUrl.length() - 1)
                : frontendBaseUrl;
    }

    @GetMapping("/c/{tagCode}")
    public ResponseEntity<Void> redirect(@PathVariable String tagCode, HttpServletRequest request) {
        logTap(tagCode, request);

        CardTag cardTag = cardTagRepository.findByTagCodeAndActiveTrue(tagCode).orElse(null);
        if (cardTag == null) {
            return redirectTo("/not-found");
        }

        Card card = cardTag.getCard();
        if (card == null || !card.isActive()) {
            return redirectTo("/not-found");
        }

        return redirectTo("/u/" + card.getSlug());
    }

    private void logTap(String tagCode, HttpServletRequest request) {
        TapLog log = new TapLog();
        log.setTagCode(tagCode);
        log.setIpAddress(resolveIp(request));
        log.setUserAgent(request.getHeader("User-Agent"));
        tapLogRepository.save(log);
    }

    private ResponseEntity<Void> redirectTo(String path) {
        HttpHeaders headers = new HttpHeaders();
        headers.setLocation(URI.create(frontendBaseUrl + path));
        return new ResponseEntity<>(headers, HttpStatus.FOUND);
    }

    private String resolveIp(HttpServletRequest request) {
        String forwarded = request.getHeader("X-Forwarded-For");
        if (forwarded != null && !forwarded.trim().isEmpty()) {
            return forwarded.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}
