package com.example.businesscard.controller;

import com.example.businesscard.dto.ApiResponse;
import com.example.businesscard.dto.NfcCardRequestResponse;
import com.example.businesscard.dto.PageResponse;
import com.example.businesscard.entity.NfcCardRequest;
import com.example.businesscard.repository.NfcCardRequestRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.lang.NonNull;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/nfc-requests")
public class AdminNfcRequestController {
    private final NfcCardRequestRepository nfcCardRequestRepository;

    public AdminNfcRequestController(NfcCardRequestRepository nfcCardRequestRepository) {
        this.nfcCardRequestRepository = nfcCardRequestRepository;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<NfcCardRequestResponse>>> list(
        @RequestParam(required = false) String q,
        @RequestParam(required = false) String status,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "10") int size
    ) {
        int safeSize = Math.min(Math.max(size, 1), 50);
        int safePage = Math.max(page, 0);
        PageRequest pageable = PageRequest.of(safePage, safeSize, Sort.by(Sort.Direction.DESC, "createdAt"));
        String query = q == null || q.isBlank() ? null : q.trim();
        String statusFilter = status == null || status.isBlank() ? null : status.trim();
        Page<NfcCardRequest> result = nfcCardRequestRepository.search(query, statusFilter, pageable);
        Page<NfcCardRequestResponse> mapped = result.map(NfcCardRequestResponse::new);
        return ResponseEntity.ok(new ApiResponse<>(true, 200, "NFC requests fetched", PageResponse.from(mapped)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<NfcCardRequestResponse>> get(@PathVariable @NonNull Long id) {
        NfcCardRequest request = nfcCardRequestRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Request not found."));
        return ResponseEntity.ok(new ApiResponse<>(true, 200, "OK", new NfcCardRequestResponse(request)));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<ApiResponse<NfcCardRequestResponse>> updateStatus(
        @PathVariable @NonNull Long id,
        @RequestBody Map<String, String> body
    ) {
        NfcCardRequest request = nfcCardRequestRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Request not found."));
        String next = body == null ? null : body.get("status");
        if (next == null || next.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "status is required.");
        }
        String normalized = next.trim().toUpperCase();
        if (!normalized.equals("PAID") && !normalized.equals("FULFILLING")
            && !normalized.equals("FULFILLED") && !normalized.equals("CANCELLED")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid status.");
        }
        request.setStatus(normalized);
        if ("FULFILLED".equals(normalized)) {
            request.setFulfilledAt(Instant.now());
        }
        return ResponseEntity.ok(new ApiResponse<>(true, 200, "Updated", new NfcCardRequestResponse(nfcCardRequestRepository.save(request))));
    }
}
