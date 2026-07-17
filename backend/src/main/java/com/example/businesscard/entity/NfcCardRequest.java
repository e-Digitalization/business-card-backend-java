package com.example.businesscard.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "nfc_card_requests")
public class NfcCardRequest {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @JsonIgnore
    @ManyToOne(optional = false)
    @JoinColumn(name = "owner_id")
    private ClientUser owner;

    @Column(nullable = false, length = 64)
    private String productCode = "NFC_CARD";

    @Column(nullable = false)
    private String productName = "Kadi Moja NFC Card";

    @Column(nullable = false)
    private Integer amount;

    @Column(nullable = false, length = 8)
    private String currency = "TZS";

    /** PENDING_PAYMENT | PAID | FULFILLING | FULFILLED | CANCELLED */
    @Column(nullable = false, length = 32)
    private String status = "PENDING_PAYMENT";

    @Column(unique = true, length = 64)
    private String paymentOrderId;

    private String phone;
    private String deliveryNotes;

    @Column(nullable = false)
    private Instant createdAt = Instant.now();

    private Instant paidAt;
    private Instant fulfilledAt;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public ClientUser getOwner() { return owner; }
    public void setOwner(ClientUser owner) { this.owner = owner; }
    public String getProductCode() { return productCode; }
    public void setProductCode(String productCode) { this.productCode = productCode; }
    public String getProductName() { return productName; }
    public void setProductName(String productName) { this.productName = productName; }
    public Integer getAmount() { return amount; }
    public void setAmount(Integer amount) { this.amount = amount; }
    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getPaymentOrderId() { return paymentOrderId; }
    public void setPaymentOrderId(String paymentOrderId) { this.paymentOrderId = paymentOrderId; }
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    public String getDeliveryNotes() { return deliveryNotes; }
    public void setDeliveryNotes(String deliveryNotes) { this.deliveryNotes = deliveryNotes; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
    public Instant getPaidAt() { return paidAt; }
    public void setPaidAt(Instant paidAt) { this.paidAt = paidAt; }
    public Instant getFulfilledAt() { return fulfilledAt; }
    public void setFulfilledAt(Instant fulfilledAt) { this.fulfilledAt = fulfilledAt; }
}
