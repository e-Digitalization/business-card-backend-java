package com.example.businesscard.controller;

import com.example.businesscard.dto.ApiResponse;
import com.example.businesscard.dto.CardRequest;
import com.example.businesscard.dto.CardResponse;
import com.example.businesscard.dto.PageResponse;
import com.example.businesscard.dto.TagRequest;
import com.example.businesscard.entity.Card;
import com.example.businesscard.entity.CardTag;
import com.example.businesscard.repository.CardRepository;
import com.example.businesscard.repository.CardTagRepository;
import com.example.businesscard.service.AiCardScanService;
import com.example.businesscard.service.CardInviteService;
import com.example.businesscard.service.PrivateSlugService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.lang.NonNull;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
public class AdminController {
    private static final Set<String> ALLOWED_THEMES = Set.of("lagoon", "midnight", "sunset", "executive", "custom");
    private final CardRepository cardRepository;
    private final CardTagRepository cardTagRepository;
    private final PrivateSlugService privateSlugService;
    private final AiCardScanService aiCardScanService;
    private final CardInviteService cardInviteService;

    public AdminController(CardRepository cardRepository,
                           CardTagRepository cardTagRepository,
                           PrivateSlugService privateSlugService,
                           AiCardScanService aiCardScanService,
                           CardInviteService cardInviteService) {
        this.cardRepository = cardRepository;
        this.cardTagRepository = cardTagRepository;
        this.privateSlugService = privateSlugService;
        this.aiCardScanService = aiCardScanService;
        this.cardInviteService = cardInviteService;
    }

    @PostMapping("/cards")
    public ResponseEntity<ApiResponse<Card>> createCard(@Valid @RequestBody CardRequest request) {
        Card card = new Card();
        applyRequest(card, request, true);
        return ResponseEntity.ok(ok("Card created", cardRepository.save(card)));
    }

    @GetMapping("/cards/scan/status")
    public ResponseEntity<ApiResponse<Map<String, Object>>> scanStatus() {
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("enabled", aiCardScanService.isEnabled());
        data.put("provider", aiCardScanService.activeProvider());
        return ResponseEntity.ok(ok("Scan status", data));
    }

    @PostMapping(value = "/cards/scan", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<Map<String, Object>>> scanCard(@RequestParam("file") MultipartFile file) {
        return ResponseEntity.ok(ok("Card scanned", aiCardScanService.scan(file).toMap()));
    }

    @PostMapping("/cards/{id}/invite")
    public ResponseEntity<ApiResponse<Map<String, Object>>> invite(@PathVariable @NonNull UUID id) {
        Card card = cardRepository.findByPublicId(id).orElse(null);
        if (card == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(fail(HttpStatus.NOT_FOUND, "Card not found"));
        }
        return ResponseEntity.ok(ok("Invite created", cardInviteService.createInvite(card.getId())));
    }

    @PutMapping("/cards/{id}")
    public ResponseEntity<ApiResponse<Card>> updateCard(@PathVariable @NonNull UUID id, @Valid @RequestBody CardRequest request) {
        Card card = cardRepository.findByPublicId(id).orElse(null);
        if (card == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(fail(HttpStatus.NOT_FOUND, "Card not found"));
        }
        applyRequest(card, request, false);
        return ResponseEntity.ok(ok("Card updated", cardRepository.save(card)));
    }

    @PostMapping("/cards/{id}/regenerate-slug")
    public ResponseEntity<ApiResponse<Card>> regenerateSlug(@PathVariable @NonNull UUID id) {
        Card card = cardRepository.findByPublicId(id).orElse(null);
        if (card == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(fail(HttpStatus.NOT_FOUND, "Card not found"));
        }
        card.setSlug(privateSlugService.nextUnique());
        return ResponseEntity.ok(ok("Private link regenerated", cardRepository.save(card)));
    }

    @GetMapping("/cards/stats")
    public ResponseEntity<ApiResponse<Map<String, Object>>> cardStats() {
        long total = cardRepository.count();
        long active = cardRepository.countByActiveTrue();
        long tags = cardTagRepository.count();
        long activeTags = cardTagRepository.countByActiveTrue();
        Map<String, Object> stats = Map.of(
            "totalCards", total,
            "activeCards", active,
            "assignedTags", tags,
            "activeTags", activeTags
        );
        return ResponseEntity.ok(ok("Card stats", stats));
    }

    @GetMapping("/cards")
    public ResponseEntity<ApiResponse<PageResponse<CardResponse>>> listCards(
        @RequestParam(required = false) String q,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "8") int size
    ) {
        int safeSize = Math.min(Math.max(size, 1), 50);
        int safePage = Math.max(page, 0);
        PageRequest pageable = PageRequest.of(safePage, safeSize, Sort.by(Sort.Direction.DESC, "id"));
        String query = q == null ? "" : q.trim();
        Page<Card> cards = cardRepository.search(query.isBlank() ? null : query, pageable);
        List<Long> cardIds = cards.getContent().stream()
            .map(Card::getId)
            .filter(id -> id != null)
            .collect(Collectors.toList());
        List<CardTag> tags = cardIds.isEmpty() ? List.of() : cardTagRepository.findByCard_IdIn(cardIds);
        Page<CardResponse> responses = cards.map(card -> toCardResponse(card, tags));
        return ResponseEntity.ok(ok("Cards fetched", PageResponse.from(responses)));
    }

    @GetMapping("/cards/{id}")
    public ResponseEntity<ApiResponse<CardResponse>> getCard(@PathVariable @NonNull UUID id) {
        Card card = cardRepository.findByPublicId(id).orElse(null);
        if (card == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(fail(HttpStatus.NOT_FOUND, "Card not found"));
        }
        List<CardTag> tags = card.getId() == null ? List.of() : cardTagRepository.findByCard_Id(card.getId());
        return ResponseEntity.ok(ok("Card fetched", toCardResponse(card, tags)));
    }

    @DeleteMapping("/cards/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteCard(@PathVariable @NonNull UUID id) {
        Card card = cardRepository.findByPublicId(id).orElse(null);
        if (card == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(fail(HttpStatus.NOT_FOUND, "Card not found"));
        }
        cardTagRepository.deleteByCard_Id(card.getId());
        cardRepository.delete(card);
        return ResponseEntity.ok(ok("Card deleted", null));
    }

    @PostMapping("/cards/{id}/tag")
    public ResponseEntity<ApiResponse<CardTag>> assignTag(@PathVariable @NonNull UUID id, @Valid @RequestBody TagRequest request) {
        Card card = cardRepository.findByPublicId(id).orElse(null);
        if (card == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(fail(HttpStatus.NOT_FOUND, "Card not found"));
        }
        if (cardTagRepository.findByTagCodeAndActiveTrue(request.getTagCode()).isPresent()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(fail(HttpStatus.BAD_REQUEST, "Tag code already assigned"));
        }
        CardTag tag = new CardTag();
        tag.setTagCode(request.getTagCode());
        tag.setCard(card);
        tag.setActive(true);
        return ResponseEntity.ok(ok("Tag assigned", cardTagRepository.save(tag)));
    }

    @PutMapping("/tags/{tagId}/deactivate")
    public ResponseEntity<ApiResponse<CardTag>> deactivateTag(@PathVariable @NonNull Long tagId) {
        CardTag tag = cardTagRepository.findById(tagId).orElse(null);
        if (tag == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(fail(HttpStatus.NOT_FOUND, "Tag not found"));
        }
        tag.setActive(false);
        return ResponseEntity.ok(ok("Tag deactivated", cardTagRepository.save(tag)));
    }

    private CardResponse toCardResponse(Card card, List<CardTag> tags) {
        if (card.getId() == null) {
            return new CardResponse(card, Collections.emptyList());
        }
        List<CardResponse.TagSummary> summaries = tags.stream()
            .filter(tag -> tag.getCard() != null && card.getId().equals(tag.getCard().getId()))
            .map(tag -> new CardResponse.TagSummary(tag.getId(), tag.getTagCode(), tag.isActive()))
            .collect(Collectors.toList());
        return new CardResponse(card, summaries, cardInviteService.accountStatus(card));
    }

    private void applyRequest(Card card, CardRequest request, boolean creating) {
        if (creating) {
            card.setSlug(privateSlugService.nextUnique());
        }
        card.setFullName(request.getFullName());
        card.setTitle(request.getTitle());
        card.setCompany(request.getCompany());
        card.setLocation(request.getLocation());
        card.setPhone(request.getPhone());
        card.setEmail(request.getEmail());
        card.setWebsite(request.getWebsite());
        card.setWhatsapp(request.getWhatsapp());
        card.setPhotoUrl(request.getPhotoUrl());
        card.setLogoUrl(request.getLogoUrl());
        card.setLinkedin(request.getLinkedin());
        card.setTwitter(request.getTwitter());
        card.setGithub(request.getGithub());
        card.setInstagram(request.getInstagram());
        card.setActive(request.isActive());

        if (request.getTheme() != null) {
            if (!ALLOWED_THEMES.contains(request.getTheme())) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Unknown card theme.");
            }
            card.setTheme(request.getTheme());
        }
        card.setPrimaryColor(request.getPrimaryColor());
        card.setAccentColor(request.getAccentColor());
    }

    private <T> ApiResponse<T> ok(String message, T data) {
        return new ApiResponse<>(true, HttpStatus.OK.value(), message, data);
    }

    private <T> ApiResponse<T> fail(HttpStatus status, String message) {
        return new ApiResponse<>(false, status.value(), message, null);
    }
}
