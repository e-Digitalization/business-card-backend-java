package com.example.businesscard.dto;

import java.util.LinkedHashMap;
import java.util.Map;

public class CardScanResult {
    private String fullName;
    private String title;
    private String company;
    private String phone;
    private String email;
    private String website;
    private String location;
    private String whatsapp;
    private String notes;
    private String provider;
    private String rawText;

    public Map<String, Object> toMap() {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("fullName", nullToEmpty(fullName));
        map.put("title", nullToEmpty(title));
        map.put("company", nullToEmpty(company));
        map.put("phone", nullToEmpty(phone));
        map.put("email", nullToEmpty(email));
        map.put("website", nullToEmpty(website));
        map.put("location", nullToEmpty(location));
        map.put("whatsapp", nullToEmpty(whatsapp));
        map.put("notes", nullToEmpty(notes));
        map.put("provider", nullToEmpty(provider));
        map.put("rawText", nullToEmpty(rawText));
        map.put("source", "scan");
        return map;
    }

    private static String nullToEmpty(String value) {
        return value == null ? "" : value.trim();
    }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getCompany() { return company; }
    public void setCompany(String company) { this.company = company; }
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getWebsite() { return website; }
    public void setWebsite(String website) { this.website = website; }
    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }
    public String getWhatsapp() { return whatsapp; }
    public void setWhatsapp(String whatsapp) { this.whatsapp = whatsapp; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
    public String getProvider() { return provider; }
    public void setProvider(String provider) { this.provider = provider; }
    public String getRawText() { return rawText; }
    public void setRawText(String rawText) { this.rawText = rawText; }
}
