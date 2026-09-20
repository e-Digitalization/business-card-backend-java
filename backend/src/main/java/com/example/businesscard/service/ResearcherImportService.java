package com.example.businesscard.service;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.Map;

/** Routes a pasted link/id to the right source: Google Scholar, or OpenAlex (also used for ORCID). */
@Service
public class ResearcherImportService {
    private final ScholarImportService scholar;
    private final OpenAlexImportService openAlex;

    public ResearcherImportService(ScholarImportService scholar, OpenAlexImportService openAlex) {
        this.scholar = scholar;
        this.openAlex = openAlex;
    }

    public Map<String, Object> importProfile(String input) {
        if (input == null || input.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                "Paste a Google Scholar link, an ORCID iD or an OpenAlex author link.");
        }
        String trimmed = input.trim();
        if (trimmed.toLowerCase().contains("scholar.google.")) {
            try {
                return scholar.importProfile(trimmed);
            } catch (ResponseStatusException e) {
                if (e.getStatusCode() == HttpStatus.BAD_GATEWAY) {
                    throw new ResponseStatusException(HttpStatus.BAD_GATEWAY,
                        e.getReason() + " Tip: paste your ORCID iD or OpenAlex link instead — those are official APIs and don't get blocked.");
                }
                throw e;
            }
        }
        if (OpenAlexImportService.supports(trimmed)) {
            return openAlex.importProfile(trimmed);
        }
        throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
            "Not recognised. Use a Google Scholar profile link, an ORCID iD (0000-0000-0000-0000) or an OpenAlex author link.");
    }
}
