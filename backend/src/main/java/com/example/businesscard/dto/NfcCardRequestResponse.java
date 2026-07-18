package com.example.businesscard.dto;

import com.example.businesscard.entity.Card;
import com.example.businesscard.entity.ClientUser;
import com.example.businesscard.entity.NfcCardRequest;

import java.time.Instant;

public class NfcCardRequestResponse {
    private final Long id;
    private final String productCode;
    private final String productName;
    private final Integer amount;
    private final String currency;
    private final String status;
    private final String paymentOrderId;
    private final String phone;
    private final String deliveryNotes;
    private final Instant createdAt;
    private final Instant paidAt;
    private final Instant fulfilledAt;
    private final Long ownerId;
    private final String ownerName;
    private final String ownerEmail;
    private final String cardSlug;
    private final String ownerTitle;
    private final String ownerCompany;
    private final String ownerPhone;
    private final String ownerPhotoUrl;
    private final String ownerLocation;

    public NfcCardRequestResponse(NfcCardRequest request) {
        ClientUser owner = request.getOwner();
        Card card = owner == null ? null : owner.getCard();
        this.id = request.getId();
        this.productCode = request.getProductCode();
        this.productName = request.getProductName();
        this.amount = request.getAmount();
        this.currency = request.getCurrency();
        this.status = request.getStatus();
        this.paymentOrderId = request.getPaymentOrderId();
        this.phone = request.getPhone();
        this.deliveryNotes = request.getDeliveryNotes();
        this.createdAt = request.getCreatedAt();
        this.paidAt = request.getPaidAt();
        this.fulfilledAt = request.getFulfilledAt();
        this.ownerId = owner == null ? null : owner.getId();
        this.ownerName = firstNonBlank(
            card == null ? null : card.getFullName(),
            owner == null ? null : owner.getFullName()
        );
        this.ownerEmail = firstNonBlank(
            card == null ? null : card.getEmail(),
            owner == null ? null : owner.getEmail()
        );
        this.cardSlug = card == null ? null : card.getSlug();
        this.ownerTitle = card == null ? null : card.getTitle();
        this.ownerCompany = card == null ? null : card.getCompany();
        this.ownerPhone = firstNonBlank(
            request.getPhone(),
            card == null ? null : card.getPhone()
        );
        this.ownerPhotoUrl = firstNonBlank(
            card == null ? null : card.getPhotoUrl(),
            owner == null ? null : owner.getPictureUrl()
        );
        this.ownerLocation = card == null || card.getLocation() == null || card.getLocation().isBlank()
            ? "Tanzania"
            : card.getLocation();
    }

    private static String firstNonBlank(String a, String b) {
        if (a != null && !a.isBlank()) return a;
        if (b != null && !b.isBlank()) return b;
        return null;
    }

    public Long getId() { return id; }
    public String getProductCode() { return productCode; }
    public String getProductName() { return productName; }
    public Integer getAmount() { return amount; }
    public String getCurrency() { return currency; }
    public String getStatus() { return status; }
    public String getPaymentOrderId() { return paymentOrderId; }
    public String getPhone() { return phone; }
    public String getDeliveryNotes() { return deliveryNotes; }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getPaidAt() { return paidAt; }
    public Instant getFulfilledAt() { return fulfilledAt; }
    public Long getOwnerId() { return ownerId; }
    public String getOwnerName() { return ownerName; }
    public String getOwnerEmail() { return ownerEmail; }
    public String getCardSlug() { return cardSlug; }
    public String getOwnerTitle() { return ownerTitle; }
    public String getOwnerCompany() { return ownerCompany; }
    public String getOwnerPhone() { return ownerPhone; }
    public String getOwnerPhotoUrl() { return ownerPhotoUrl; }
    public String getOwnerLocation() { return ownerLocation; }
}
