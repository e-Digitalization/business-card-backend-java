package com.example.businesscard.dto;

import com.example.businesscard.entity.Card;
import java.util.List;

public class CardResponse {
    private Card card;
    private List<TagSummary> tags;

    public CardResponse(Card card, List<TagSummary> tags) {
        this.card = card;
        this.tags = tags;
    }

    public Card getCard() {
        return card;
    }

    public List<TagSummary> getTags() {
        return tags;
    }

    public static class TagSummary {
        private Long id;
        private String tagCode;
        private boolean active;

        public TagSummary(Long id, String tagCode, boolean active) {
            this.id = id;
            this.tagCode = tagCode;
            this.active = active;
        }

        public Long getId() {
            return id;
        }

        public String getTagCode() {
            return tagCode;
        }

        public boolean isActive() {
            return active;
        }
    }
}
