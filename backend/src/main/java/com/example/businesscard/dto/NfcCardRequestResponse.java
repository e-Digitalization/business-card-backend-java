package com.example.businesscard.dto;

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

    public NfcCardRequestResponse(
        NfcCardRequest request,
        String ownerName,
        String ownerEmail,
        String cardSlug
    ) {
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
        this.ownerId = request.getOwner() == null ? null : request.getOwner().getId();
        this.ownerName = ownerName;
        this.ownerEmail = ownerEmail;
        this.cardSlug = cardSlug;
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
}
