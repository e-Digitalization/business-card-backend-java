package com.example.businesscard.service;

import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Reads a public Google Scholar profile page and maps it to the card's researcher
 * data. Scholar has no official API, so this parses the public HTML and can stop
 * working (or be rate limited / captcha-blocked) at any time; callers must be
 * prepared for a failure and let the user enter details manually.
 */
@Service
public class ScholarImportService {
    private static final String HOST = "scholar.google.com";
    private static final Pattern USER_ID = Pattern.compile("^[A-Za-z0-9_-]{8,20}$");
    private static final Pattern TRAILING_YEAR = Pattern.compile(",?\\s*\\d{4}$");
    private static final Pattern SINCE_YEAR = Pattern.compile("(?i)since\\s*(\\d{4})");
    private static final Pattern RIGHT_PX = Pattern.compile("right:\\s*(\\d+)px");
    private static final int BAR_OFFSET_PX = 5;
    private static final int MAX_PAPERS = 100;

    private final HttpClient client = HttpClient.newBuilder()
        .connectTimeout(Duration.ofSeconds(8))
        .followRedirects(HttpClient.Redirect.NEVER)
        .build();

    /** Validates the pasted link and returns the Scholar user id. Only scholar.google.com is ever contacted. */
    static String extractUserId(String rawUrl) {
        if (rawUrl == null || rawUrl.isBlank()) {
            throw bad("Paste a Google Scholar profile link.");
        }
        String candidate = rawUrl.trim();
        if (!candidate.matches("(?i)^https?://.*")) {
            candidate = "https://" + candidate;
        }
        URI uri;
        try {
            uri = URI.create(candidate);
        } catch (IllegalArgumentException e) {
            throw bad("That doesn't look like a valid link.");
        }
        if (uri.getHost() == null || !HOST.equalsIgnoreCase(uri.getHost()) || !"/citations".equals(uri.getPath())) {
            throw bad("Use a Google Scholar profile link, e.g. https://scholar.google.com/citations?user=XXXX");
        }
        String query = uri.getRawQuery() == null ? "" : uri.getRawQuery();
        for (String part : query.split("&")) {
            if (part.startsWith("user=")) {
                String id = part.substring(5);
                if (USER_ID.matcher(id).matches()) {
                    return id;
                }
            }
        }
        throw bad("The link has no Scholar profile id (user=…).");
    }

    public Map<String, Object> importProfile(String rawUrl) {
        String userId = extractUserId(rawUrl);
        String profileUrl = "https://" + HOST + "/citations?user=" + userId + "&hl=en";
        return parseProfile(fetch(profileUrl + "&cstart=0&pagesize=" + MAX_PAPERS), profileUrl);
    }

    /** Maps a fetched Scholar profile page to the researcher data structure. */
    Map<String, Object> parseProfile(String html, String profileUrl) {
        Document doc = Jsoup.parse(html, "https://" + HOST);

        Element nameEl = doc.selectFirst("#gsc_prf_in");
        if (nameEl == null) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY,
                "Google Scholar didn't return that profile (it may be private, missing, or blocking automated "
                    + "requests). Try again later or enter the details manually.");
        }

        Map<String, Object> researcher = new LinkedHashMap<>();
        researcher.put("scholarUrl", profileUrl);
        researcher.put("interests", String.join(", ", texts(doc.select("a.gsc_prf_inta"))));

        String since = "";
        for (Element head : doc.select("th.gsc_rsb_sth")) {
            Matcher m = SINCE_YEAR.matcher(head.text());
            if (m.find()) {
                since = m.group(1);
                break;
            }
        }
        researcher.put("sinceYear", since);

        Elements std = doc.select("td.gsc_rsb_std");
        Map<String, String> metrics = new LinkedHashMap<>();
        String[] keys = {"citations", "citationsSince", "hIndex", "hIndexSince", "i10Index", "i10IndexSince"};
        for (int i = 0; i < keys.length; i++) {
            metrics.put(keys[i], i < std.size() ? std.get(i).text().trim() : "");
        }
        researcher.put("metrics", metrics);

        researcher.put("citationsByYear", citationsByYear(doc));

        List<Map<String, String>> papers = new ArrayList<>();
        for (Element row : doc.select("tr.gsc_a_tr")) {
            Element title = row.selectFirst("a.gsc_a_at");
            if (title == null) {
                continue;
            }
            Elements gray = row.select("div.gs_gray");
            Element cited = row.selectFirst("a.gsc_a_ac");
            Element year = row.selectFirst("span.gsc_a_h");
            Map<String, String> paper = new LinkedHashMap<>();
            paper.put("title", title.text().trim());
            paper.put("authors", gray.size() > 0 ? gray.get(0).text().trim() : "");
            paper.put("venue", gray.size() > 1 ? TRAILING_YEAR.matcher(gray.get(1).text().trim()).replaceFirst("") : "");
            paper.put("year", year == null ? "" : year.text().trim());
            paper.put("citedBy", cited == null ? "" : cited.text().trim());
            paper.put("url", title.hasAttr("href") ? title.absUrl("href") : "");
            papers.add(paper);
        }
        researcher.put("publications", papers);

        Element aff = doc.selectFirst("div.gsc_prf_il");
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("name", nameEl.text().trim());
        result.put("affiliation", aff == null ? "" : aff.text().trim());
        result.put("researcher", researcher);
        return result;
    }

    /**
     * Scholar only renders a bar for years that have citations and positions each one with a
     * CSS "right:" offset (the bar sits BAR_OFFSET_PX right of its year label), so bars must be
     * matched to years by position, not by order. Years without a bar have zero citations.
     */
    private static List<Map<String, Object>> citationsByYear(Document doc) {
        Elements labels = doc.select(".gsc_md_hist_b .gsc_g_t");
        Elements bars = doc.select(".gsc_md_hist_b .gsc_g_a");
        List<Map<String, Object>> byYear = new ArrayList<>();
        for (Element label : labels) {
            int labelRight = rightPx(label);
            int count = 0;
            for (Element bar : bars) {
                if (Math.abs(rightPx(bar) - labelRight - BAR_OFFSET_PX) <= 3) {
                    Element value = bar.selectFirst(".gsc_g_al");
                    count = value == null ? 0 : parseInt(value.text());
                    break;
                }
            }
            Map<String, Object> row = new LinkedHashMap<>();
            row.put("year", label.text().trim());
            row.put("count", count);
            byYear.add(row);
        }
        return byYear;
    }

    private static int rightPx(Element el) {
        Matcher m = RIGHT_PX.matcher(el.attr("style"));
        return m.find() ? Integer.parseInt(m.group(1)) : Integer.MIN_VALUE / 2;
    }

    private String fetch(String url) {
        HttpRequest request = HttpRequest.newBuilder(URI.create(url))
            .timeout(Duration.ofSeconds(12))
            .header("User-Agent", "Mozilla/5.0 (compatible; KadiMojaProfileImport/1.0)")
            .header("Accept-Language", "en")
            .GET()
            .build();
        try {
            HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() != 200) {
                throw new ResponseStatusException(HttpStatus.BAD_GATEWAY,
                    "Google Scholar responded with status " + response.statusCode()
                        + ". Try again later or enter the details manually.");
            }
            return response.body();
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "The Scholar request was interrupted.");
        } catch (java.io.IOException e) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY,
                "Couldn't reach Google Scholar. Try again later or enter the details manually.");
        }
    }

    private static List<String> texts(Elements elements) {
        List<String> out = new ArrayList<>();
        for (Element el : elements) {
            String t = el.text().trim();
            if (!t.isEmpty()) {
                out.add(t);
            }
        }
        return out;
    }

    private static int parseInt(String value) {
        try {
            return Integer.parseInt(value.replaceAll("[^0-9]", ""));
        } catch (NumberFormatException e) {
            return 0;
        }
    }

    private static ResponseStatusException bad(String message) {
        return new ResponseStatusException(HttpStatus.BAD_REQUEST, message);
    }
}
