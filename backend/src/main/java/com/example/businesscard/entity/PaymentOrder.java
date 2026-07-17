package com.example.businesscard.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "payment_orders")
public class PaymentOrder {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @JsonIgnore
    @ManyToOne(optional = false)
    @JoinColumn(name = "owner_id")
    private ClientUser owner;

    @Column(nullable = false, unique = true, length = 64)
    private String orderId;

    @Column(nullable = false)
    private Integer amount;

    @Column(nullable = false, length = 8)
    private String currency = "TZS";

    @Column(nullable = false, length = 64)
    private String purpose = "AI_SCAN_SUBSCRIPTION";

    @Column(nullable = false, length = 32)
    private String status = "PENDING";

    @Column(columnDefinition = "TEXT")
    private String paymentGatewayUrl;

    private String paymentToken;
    private String selcomReference;
    private String channel;
    private String phone;

    @Column(nullable = false)
    private Instant createdAt = Instant.now();

    private Instant paidAt;

    private Long nfcRequestId;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public ClientUser getOwner() { return owner; }
    public void setOwner(ClientUser owner) { this.owner = owner; }
    public String getOrderId() { return orderId; }
    public void setOrderId(String orderId) { this.orderId = orderId; }
    public Integer getAmount() { return amount; }
    public void setAmount(Integer amount) { this.amount = amount; }
    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }
    public String getPurpose() { return purpose; }
    public void setPurpose(String purpose) { this.purpose = purpose; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getPaymentGatewayUrl() { return paymentGatewayUrl; }
    public void setPaymentGatewayUrl(String paymentGatewayUrl) { this.paymentGatewayUrl = paymentGatewayUrl; }
    public String getPaymentToken() { return paymentToken; }
    public void setPaymentToken(String paymentToken) { this.paymentToken = paymentToken; }
    public String getSelcomReference() { return selcomReference; }
    public void setSelcomReference(String selcomReference) { this.selcomReference = selcomReference; }
    public String getChannel() { return channel; }
    public void setChannel(String channel) { this.channel = channel; }
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
    public Instant getPaidAt() { return paidAt; }
    public void setPaidAt(Instant paidAt) { this.paidAt = paidAt; }
    public Long getNfcRequestId() { return nfcRequestId; }
    public void setNfcRequestId(Long nfcRequestId) { this.nfcRequestId = nfcRequestId; }
}
