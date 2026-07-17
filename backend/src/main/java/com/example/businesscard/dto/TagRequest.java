package com.example.businesscard.dto;

import jakarta.validation.constraints.NotBlank;

public class TagRequest {
    @NotBlank
    private String tagCode;

    public String getTagCode() {
        return tagCode;
    }

    public void setTagCode(String tagCode) {
        this.tagCode = tagCode;
    }
}
