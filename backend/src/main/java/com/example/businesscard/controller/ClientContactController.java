package com.example.businesscard.controller;

import com.example.businesscard.dto.ApiResponse;
import com.example.businesscard.dto.PageResponse;
import com.example.businesscard.dto.SavedContactRequest;
import com.example.businesscard.entity.ClientUser;
import com.example.businesscard.entity.SavedContact;
import com.example.businesscard.repository.SavedContactRepository;
import com.example.businesscard.service.AiCardScanService;
import com.example.businesscard.service.ClientAuthService;
import com.example.businesscard.service.ScanQuotaService;
import com.example.businesscard.service.SelcomCheckoutService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.util.LinkedHashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/client/contacts")
public class ClientContactController {
    private final ClientAuthService clientAuthService;
    private final SavedContactRepository savedContactRepository;
    private final AiCardScanService aiCardScanService;
    private final ScanQuotaService scanQuotaService;
    private final SelcomCheckoutService selcomCheckoutService;

    public ClientContactController(ClientAuthService clientAuthService,
                                   SavedContactRepository savedContactRepository,
                                   AiCardScanService aiCardScanService,
                                   ScanQuotaService scanQuotaService,
                                   SelcomCheckoutService selcomCheckoutService) {
        this.clientAuthService = clientAuthService;
        this.savedContactRepository = savedContactRepository;
        this.aiCardScanService = aiCardScanService;
        this.scanQuotaService = scanQuotaService;
        this.selcomCheckoutService = selcomCheckoutService;
    }

    @GetMapping
    public ApiResponse<PageResponse<SavedContact>> list(
        HttpServletRequest request,
        @RequestParam(required = false) String q,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "10") int size
    ) {
        ClientUser user = currentUser(request);
        int safeSize = Math.min(Math.max(size, 1), 50);
        int safePage = Math.max(page, 0);
        PageRequest pageable = PageRequest.of(safePage, safeSize, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<SavedContact> result;
        if (q != null && !q.trim().isBlank()) {
            result = savedContactRepository.search(user, q.trim(), pageable);
        } else {
            result = savedContactRepository.findByOwnerOrderByCreatedAtDesc(user, pageable);
        }
        return ApiResponse.ok(PageResponse.from(result));
    }

    @GetMapping("/scan/status")
    public ApiResponse<Map<String, Object>> scanStatus(HttpServletRequest request) {
        ClientUser user = currentUser(request);
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("enabled", aiCardScanService.isEnabled());
        data.put("provider", aiCardScanService.activeProvider());
        data.putAll(scanQuotaService.quotaSnapshot(user));
        data.put("priceTzs", selcomCheckoutService.amountTzs());
        data.put("currency", selcomCheckoutService.currency());
        data.put("paymentProvider", selcomCheckoutService.isLiveConfigured() ? "selcom" : "mock");
        return ApiResponse.ok(data);
    }

    @PostMapping(value = "/scan", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ApiResponse<Map<String, Object>> scanCard(HttpServletRequest request,
                                                     @RequestParam("file") MultipartFile file) {
        ClientUser user = currentUser(request);
        scanQuotaService.assertCanScan(user);
        Map<String, Object> result = aiCardScanService.scan(file).toMap();
        ClientUser updated = scanQuotaService.recordSuccessfulScan(user);
        result.putAll(scanQuotaService.quotaSnapshot(updated));
        return ApiResponse.ok(result);
    }

    @PostMapping
    public ApiResponse<SavedContact> create(HttpServletRequest request, @RequestBody SavedContactRequest body) {
        ClientUser user = currentUser(request);

        if (body.getSourceProfileSlug() != null && !body.getSourceProfileSlug().isBlank()) {
            var existing = savedContactRepository.findByOwnerAndSourceProfileSlug(user, body.getSourceProfileSlug());
            if (existing.isPresent()) {
                SavedContact contact = existing.get();
                apply(contact, body);
                return ApiResponse.ok(savedContactRepository.save(contact));
            }
        }

        SavedContact contact = new SavedContact();
        contact.setOwner(user);
        apply(contact, body);
        if (contact.getSource() == null || contact.getSource().isBlank()) {
            contact.setSource("manual");
        }
        return ApiResponse.ok(savedContactRepository.save(contact));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(HttpServletRequest request, @PathVariable Long id) {
        ClientUser user = currentUser(request);
        SavedContact contact = savedContactRepository.findByIdAndOwner(id, user)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Contact not found."));
        savedContactRepository.delete(contact);
        return ApiResponse.ok(null);
    }

    private void apply(SavedContact contact, SavedContactRequest body) {
        if (body.getFullName() != null) contact.setFullName(body.getFullName());
        if (body.getTitle() != null) contact.setTitle(body.getTitle());
        if (body.getCompany() != null) contact.setCompany(body.getCompany());
        if (body.getPhone() != null) contact.setPhone(body.getPhone());
        if (body.getEmail() != null) contact.setEmail(body.getEmail());
        if (body.getWebsite() != null) contact.setWebsite(body.getWebsite());
        if (body.getLocation() != null) contact.setLocation(body.getLocation());
        if (body.getWhatsapp() != null) contact.setWhatsapp(body.getWhatsapp());
        if (body.getPhotoUrl() != null) contact.setPhotoUrl(body.getPhotoUrl());
        if (body.getSourceProfileSlug() != null) contact.setSourceProfileSlug(body.getSourceProfileSlug());
        if (body.getSource() != null) contact.setSource(body.getSource());
        if (body.getNotes() != null) contact.setNotes(body.getNotes());
    }

    private ClientUser currentUser(HttpServletRequest request) {
        Object uid = request.getAttribute("authUserId");
        if (!(uid instanceof Long userId)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Missing client session.");
        }
        return clientAuthService.requireUser(userId);
    }
}
