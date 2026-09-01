package com.example.businesscard.controller;

import com.example.businesscard.dto.ApiResponse;
import com.example.businesscard.dto.CardRequest;
import com.example.businesscard.entity.Card;
import com.example.businesscard.entity.ClientUser;
import com.example.businesscard.repository.CardRepository;
import com.example.businesscard.repository.TapLogRepository;
import com.example.businesscard.service.ClientAuthService;
import com.example.businesscard.service.PhotoUploadService;
import com.example.businesscard.util.ProfileLinkSanitizer;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.util.HashMap;
import java.util.Map;
import java.util.Set;

@RestController
@RequestMapping("/api/client")
public class ClientCardController {
    private static final Set<String> ALLOWED_THEMES = Set.of("lagoon", "midnight", "sunset", "executive", "custom");
    private final ClientAuthService clientAuthService;
    private final CardRepository cardRepository;
    private final PhotoUploadService photoUploadService;
    private final TapLogRepository tapLogRepository;

    public ClientCardController(ClientAuthService clientAuthService,
                                CardRepository cardRepository,
                                PhotoUploadService photoUploadService,
                                TapLogRepository tapLogRepository) {
        this.clientAuthService = clientAuthService;
        this.cardRepository = cardRepository;
        this.photoUploadService = photoUploadService;
        this.tapLogRepository = tapLogRepository;
    }

    @GetMapping("/me")
    public ApiResponse<Map<String, Object>> me(HttpServletRequest request) {
        ClientUser user = currentUser(request);
        Map<String, Object> body = new HashMap<>();
        body.put("id", user.getId());
        body.put("email", user.getEmail());
        body.put("fullName", user.getFullName());
        body.put("pictureUrl", user.getPictureUrl());
        body.put("hasGoogle", user.getGoogleSub() != null);
        body.put("card", withTapCount(user.getCard()));
        return ApiResponse.ok(body);
    }

    @GetMapping("/me/card")
    public ApiResponse<Card> getCard(HttpServletRequest request) {
        ClientUser user = currentUser(request);
        Card card = clientAuthService.ensureCard(user, false);
        return ApiResponse.ok(withTapCount(card));
    }

    @PutMapping("/me/card")
    public ApiResponse<Card> updateCard(HttpServletRequest request, @Valid @RequestBody CardRequest body) {
        ClientUser user = currentUser(request);
        Card card = clientAuthService.ensureCard(user, false);

        // Clients cannot set a guessable custom slug — keep the private opaque link.
        card.setFullName(body.getFullName());
        card.setTitle(body.getTitle());
        card.setCompany(body.getCompany());
        card.setLocation(body.getLocation());
        card.setPhone(body.getPhone());
        card.setEmail(body.getEmail());
        card.setWebsite(ProfileLinkSanitizer.sanitize(body.getWebsite(), body.getPhotoUrl()));
        card.setWhatsapp(body.getWhatsapp());
        card.setPhotoUrl(body.getPhotoUrl());
        card.setLogoUrl(body.getLogoUrl());
        card.setLinkedin(ProfileLinkSanitizer.sanitize(body.getLinkedin(), body.getPhotoUrl()));
        card.setTwitter(ProfileLinkSanitizer.sanitize(body.getTwitter(), body.getPhotoUrl()));
        card.setGithub(ProfileLinkSanitizer.sanitize(body.getGithub(), body.getPhotoUrl()));
        card.setInstagram(ProfileLinkSanitizer.sanitize(body.getInstagram(), body.getPhotoUrl()));
        card.setYoutubeChannel(ProfileLinkSanitizer.sanitize(body.getYoutubeChannel(), body.getPhotoUrl()));
        card.setYoutubeVideos(body.getYoutubeVideos());
        card.setBookingUrl(ProfileLinkSanitizer.sanitize(body.getBookingUrl(), body.getPhotoUrl()));
        card.setPodcastUrl(ProfileLinkSanitizer.sanitize(body.getPodcastUrl(), body.getPhotoUrl()));
        card.setTiktok(ProfileLinkSanitizer.sanitize(body.getTiktok(), body.getPhotoUrl()));
        card.setTelegram(ProfileLinkSanitizer.sanitize(body.getTelegram(), body.getPhotoUrl()));
        card.setWechat(ProfileLinkSanitizer.sanitize(body.getWechat(), body.getPhotoUrl()));
        card.setWeibo(ProfileLinkSanitizer.sanitize(body.getWeibo(), body.getPhotoUrl()));
        card.setDouyin(ProfileLinkSanitizer.sanitize(body.getDouyin(), body.getPhotoUrl()));
        card.setXiaohongshu(ProfileLinkSanitizer.sanitize(body.getXiaohongshu(), body.getPhotoUrl()));
        card.setActive(body.isActive());

        if (body.getTheme() != null) {
            if (!ALLOWED_THEMES.contains(body.getTheme())) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Unknown card theme.");
            }
            card.setTheme(body.getTheme());
        }
        card.setPrimaryColor(body.getPrimaryColor());
        card.setAccentColor(body.getAccentColor());

        if (body.getFullName() != null && !body.getFullName().isBlank()) {
            user.setFullName(body.getFullName());
        }

        return ApiResponse.ok(cardRepository.save(card));
    }

    @PostMapping("/me/card/use-google-photo")
    public ApiResponse<Card> useGooglePhoto(HttpServletRequest request) {
        ClientUser user = currentUser(request);
        if (user.getPictureUrl() == null || user.getPictureUrl().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "No Google picture available. Sign in with Google first.");
        }
        Card card = clientAuthService.ensureCard(user, false);
        card.setPhotoUrl(user.getPictureUrl());
        return ApiResponse.ok(cardRepository.save(card));
    }

    @PostMapping(value = "/me/card/photo", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ApiResponse<Card> uploadPhoto(HttpServletRequest request, @RequestParam("file") MultipartFile file) {
        ClientUser user = currentUser(request);
        String path = photoUploadService.store(file);
        Card card = clientAuthService.ensureCard(user, false);
        card.setPhotoUrl(path);
        return ApiResponse.ok(cardRepository.save(card));
    }

    @DeleteMapping("/me/card/photo")
    public ApiResponse<Card> clearPhoto(HttpServletRequest request) {
        ClientUser user = currentUser(request);
        Card card = clientAuthService.ensureCard(user, false);
        card.setPhotoUrl(null);
        return ApiResponse.ok(cardRepository.save(card));
    }

    @PostMapping(value = "/me/card/logo", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ApiResponse<Card> uploadLogo(HttpServletRequest request, @RequestParam("file") MultipartFile file) {
        ClientUser user = currentUser(request);
        String path = photoUploadService.store(file, "logos");
        Card card = clientAuthService.ensureCard(user, false);
        card.setLogoUrl(path);
        return ApiResponse.ok(cardRepository.save(card));
    }

    @DeleteMapping("/me/card/logo")
    public ApiResponse<Card> clearLogo(HttpServletRequest request) {
        ClientUser user = currentUser(request);
        Card card = clientAuthService.ensureCard(user, false);
        card.setLogoUrl(null);
        return ApiResponse.ok(cardRepository.save(card));
    }

    private Card withTapCount(Card card) {
        if (card != null) {
            card.setTapCount(tapLogRepository.countByCardId(card.getId()));
        }
        return card;
    }

    private ClientUser currentUser(HttpServletRequest request) {
        Object uid = request.getAttribute("authUserId");
        if (!(uid instanceof Long userId)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Missing client session.");
        }
        return clientAuthService.requireUser(userId);
    }
}
