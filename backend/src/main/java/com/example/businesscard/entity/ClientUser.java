package com.example.businesscard.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

import java.time.Instant;

@Entity
@Table(name = "client_users")
public class ClientUser {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true)
    private String googleSub;

    @Column(unique = true, nullable = false)
    @Email
    @NotBlank
    private String email;

    @JsonIgnore
    private String passwordHash;

    private String fullName;

    @Column(columnDefinition = "TEXT")
    private String pictureUrl;

    @OneToOne
    @JoinColumn(name = "card_id")
    private Card card;

    @Column(nullable = false)
    private int aiScanCount = 0;

    @Column(nullable = false)
    private boolean scanSubscribed = false;

    private Instant scanSubscribedAt;

    private Instant scanSubscriptionExpiresAt;

    // Scans consumed in the current subscription month; reset on renewal.
    @Column(nullable = false)
    private int scanSubscriptionUsed = 0;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getGoogleSub() {
        return googleSub;
    }

    public void setGoogleSub(String googleSub) {
        this.googleSub = googleSub;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPasswordHash() {
        return passwordHash;
    }

    public void setPasswordHash(String passwordHash) {
        this.passwordHash = passwordHash;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getPictureUrl() {
        return pictureUrl;
    }

    public void setPictureUrl(String pictureUrl) {
        this.pictureUrl = pictureUrl;
    }

    public Card getCard() {
        return card;
    }

    public void setCard(Card card) {
        this.card = card;
    }

    public int getAiScanCount() {
        return aiScanCount;
    }

    public void setAiScanCount(int aiScanCount) {
        this.aiScanCount = aiScanCount;
    }

    public boolean isScanSubscribed() {
        return scanSubscribed;
    }

    public void setScanSubscribed(boolean scanSubscribed) {
        this.scanSubscribed = scanSubscribed;
    }

    public Instant getScanSubscribedAt() {
        return scanSubscribedAt;
    }

    public void setScanSubscribedAt(Instant scanSubscribedAt) {
        this.scanSubscribedAt = scanSubscribedAt;
    }

    public Instant getScanSubscriptionExpiresAt() {
        return scanSubscriptionExpiresAt;
    }

    public void setScanSubscriptionExpiresAt(Instant scanSubscriptionExpiresAt) {
        this.scanSubscriptionExpiresAt = scanSubscriptionExpiresAt;
    }

    public int getScanSubscriptionUsed() {
        return scanSubscriptionUsed;
    }

    public void setScanSubscriptionUsed(int scanSubscriptionUsed) {
        this.scanSubscriptionUsed = scanSubscriptionUsed;
    }
}
