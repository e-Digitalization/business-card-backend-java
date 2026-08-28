package com.example.businesscard.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

import java.util.UUID;

@Entity
@Table(name = "cards")
public class Card {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @JsonIgnore
    private Long id;

    // Non-sequential identifier used everywhere outside the DB (URLs, API paths) so
    // card records can't be enumerated by walking an integer id.
    @Column(name = "public_id", nullable = false, unique = true, updatable = false)
    private UUID publicId = UUID.randomUUID();

    @Column(unique = true, nullable = false)
    @NotBlank
    private String slug;

    private String fullName;
    private String title;
    private String company;
    private String location;
    private String phone;

    @Email
    private String email;

    private String website;
    private String whatsapp;
    @Column(columnDefinition = "TEXT")
    private String photoUrl;
    @Column(columnDefinition = "TEXT")
    private String logoUrl;
    private String linkedin;
    private String twitter;
    private String github;
    private String instagram;
    @Column(columnDefinition = "TEXT")
    private String youtubeChannel;
    // Newline-separated list of featured YouTube video URLs / ids.
    @Column(name = "youtube_videos", columnDefinition = "TEXT")
    private String youtubeVideos;
    @Column(columnDefinition = "TEXT")
    private String bookingUrl;
    @Column(columnDefinition = "TEXT")
    private String podcastUrl;
    private String tiktok;
    private String telegram;
    private String wechat;
    private String weibo;
    private String douyin;
    private String xiaohongshu;

    // One of "lagoon" (default), "midnight", "sunset", "executive", "custom" — see frontend/src/utils/cardTheme.js
    private String theme = "lagoon";
    @Column(name = "primary_color")
    private String primaryColor;
    @Column(name = "accent_color")
    private String accentColor;

    private boolean active = true;

    // Populated on demand from TapLogRepository — not persisted on the card itself.
    @Transient
    private long tapCount;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public UUID getPublicId() {
        return publicId;
    }

    public void setPublicId(UUID publicId) {
        this.publicId = publicId;
    }

    public String getSlug() {
        return slug;
    }

    public void setSlug(String slug) {
        this.slug = slug;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getCompany() {
        return company;
    }

    public void setCompany(String company) {
        this.company = company;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getWebsite() {
        return website;
    }

    public void setWebsite(String website) {
        this.website = website;
    }

    public String getWhatsapp() {
        return whatsapp;
    }

    public void setWhatsapp(String whatsapp) {
        this.whatsapp = whatsapp;
    }

    public String getPhotoUrl() {
        return photoUrl;
    }

    public void setPhotoUrl(String photoUrl) {
        this.photoUrl = photoUrl;
    }

    public String getLogoUrl() {
        return logoUrl;
    }

    public void setLogoUrl(String logoUrl) {
        this.logoUrl = logoUrl;
    }

    public String getLinkedin() {
        return linkedin;
    }

    public void setLinkedin(String linkedin) {
        this.linkedin = linkedin;
    }

    public String getTwitter() {
        return twitter;
    }

    public void setTwitter(String twitter) {
        this.twitter = twitter;
    }

    public String getGithub() {
        return github;
    }

    public void setGithub(String github) {
        this.github = github;
    }

    public String getInstagram() {
        return instagram;
    }

    public void setInstagram(String instagram) {
        this.instagram = instagram;
    }

    public String getYoutubeChannel() {
        return youtubeChannel;
    }

    public void setYoutubeChannel(String youtubeChannel) {
        this.youtubeChannel = youtubeChannel;
    }

    public String getYoutubeVideos() {
        return youtubeVideos;
    }

    public void setYoutubeVideos(String youtubeVideos) {
        this.youtubeVideos = youtubeVideos;
    }

    public String getBookingUrl() {
        return bookingUrl;
    }

    public void setBookingUrl(String bookingUrl) {
        this.bookingUrl = bookingUrl;
    }

    public String getPodcastUrl() {
        return podcastUrl;
    }

    public void setPodcastUrl(String podcastUrl) {
        this.podcastUrl = podcastUrl;
    }

    public String getTiktok() {
        return tiktok;
    }

    public void setTiktok(String tiktok) {
        this.tiktok = tiktok;
    }

    public String getTelegram() {
        return telegram;
    }

    public void setTelegram(String telegram) {
        this.telegram = telegram;
    }

    public String getWechat() {
        return wechat;
    }

    public void setWechat(String wechat) {
        this.wechat = wechat;
    }

    public String getWeibo() {
        return weibo;
    }

    public void setWeibo(String weibo) {
        this.weibo = weibo;
    }

    public String getDouyin() {
        return douyin;
    }

    public void setDouyin(String douyin) {
        this.douyin = douyin;
    }

    public String getXiaohongshu() {
        return xiaohongshu;
    }

    public void setXiaohongshu(String xiaohongshu) {
        this.xiaohongshu = xiaohongshu;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }

    public String getTheme() {
        return theme;
    }

    public void setTheme(String theme) {
        this.theme = theme;
    }

    public String getPrimaryColor() {
        return primaryColor;
    }

    public void setPrimaryColor(String primaryColor) {
        this.primaryColor = primaryColor;
    }

    public String getAccentColor() {
        return accentColor;
    }

    public void setAccentColor(String accentColor) {
        this.accentColor = accentColor;
    }

    public long getTapCount() {
        return tapCount;
    }

    public void setTapCount(long tapCount) {
        this.tapCount = tapCount;
    }
}
