package com.example.businesscard.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.time.Year;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Builds researcher data from OpenAlex (https://openalex.org), a free, official,
 * open scholarly API. An ORCID iD is resolved through OpenAlex too, so ORCID
 * links get citation counts as well as the publication list. Only api.openalex.org
 * is ever contacted, and only with ids validated by the patterns below.
 */
@Service
public class OpenAlexImportService {
    private static final String API = "https://api.openalex.org";
    static final Pattern ORCID = Pattern.compile("(?<![0-9])(\\d{4}-\\d{4}-\\d{4}-\\d{3}[\\dXx])(?![0-9])");
    static final Pattern AUTHOR_ID = Pattern.compile("(?i)(?:openalex\\.org/(?:authors/)?|^)(A\\d{4,12})(?![0-9A-Za-z])");
    private static final int MAX_PAPERS = 100;
    private static final int SINCE_WINDOW_YEARS = 5;

    private final ObjectMapper mapper = new ObjectMapper();
    private final HttpClient client = HttpClient.newBuilder()
        .connectTimeout(Duration.ofSeconds(8))
        .followRedirects(HttpClient.Redirect.NEVER)
        .build();

    /** True when the input is an ORCID iD/link or an OpenAlex author id/link. */
    public static boolean supports(String input) {
        return input != null && (ORCID.matcher(input).find() || AUTHOR_ID.matcher(input.trim()).find());
    }

    public Map<String, Object> importProfile(String input) {
        String raw = input == null ? "" : input.trim();
        String authorPath;
        Matcher orcid = ORCID.matcher(raw);
        Matcher author = AUTHOR_ID.matcher(raw);
        if (author.find()) {
            authorPath = "/authors/" + author.group(1).toUpperCase();
        } else if (orcid.find()) {
            // OpenAlex can hold several records for one ORCID (duplicates with a handful of
            // works); the most-cited one is the real profile.
            JsonNode matches = get(API + "/authors?filter=orcid:https://orcid.org/" + orcid.group(1).toUpperCase()
                + "&sort=cited_by_count:desc&per-page=1&select=id");
            JsonNode top = matches.path("results").path(0);
            if (top.isMissingNode() || top.path("id").asText("").isBlank()) {
                throw new ResponseStatusException(HttpStatus.NOT_FOUND,
                    "No researcher with that ORCID / OpenAlex id was found on OpenAlex.");
            }
            String topId = top.path("id").asText();
            authorPath = "/authors/" + topId.substring(topId.lastIndexOf('/') + 1);
        } else {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Paste an ORCID iD or an OpenAlex author link.");
        }

        JsonNode a = get(API + authorPath);
        String openAlexId = a.path("id").asText("");
        String shortId = openAlexId.substring(openAlexId.lastIndexOf('/') + 1);

        Map<String, Object> researcher = new LinkedHashMap<>();
        String orcidUrl = a.path("orcid").asText("");
        researcher.put("scholarUrl", orcidUrl.isBlank() ? openAlexId : orcidUrl);

        List<String> topics = new ArrayList<>();
        for (JsonNode t : a.path("topics")) {
            if (topics.size() < 5) {
                topics.add(t.path("display_name").asText());
            }
        }
        researcher.put("interests", String.join(", ", topics));

        int sinceYear = Year.now().getValue() - SINCE_WINDOW_YEARS;
        researcher.put("sinceYear", String.valueOf(sinceYear));

        List<Map<String, Object>> byYear = new ArrayList<>();
        long citationsSince = 0;
        JsonNode counts = a.path("counts_by_year");
        List<JsonNode> sorted = new ArrayList<>();
        counts.forEach(sorted::add);
        sorted.sort((x, y) -> Integer.compare(x.path("year").asInt(), y.path("year").asInt()));
        for (JsonNode c : sorted) {
            int year = c.path("year").asInt();
            int cited = c.path("cited_by_count").asInt();
            Map<String, Object> row = new LinkedHashMap<>();
            row.put("year", String.valueOf(year));
            row.put("count", cited);
            byYear.add(row);
            if (year >= sinceYear) {
                citationsSince += cited;
            }
        }
        researcher.put("citationsByYear", byYear);

        // OpenAlex has no "since" h-index / i10-index; those two stay blank rather than guessed.
        Map<String, String> metrics = new LinkedHashMap<>();
        JsonNode stats = a.path("summary_stats");
        metrics.put("citations", String.valueOf(a.path("cited_by_count").asInt()));
        metrics.put("citationsSince", byYear.isEmpty() ? "" : String.valueOf(citationsSince));
        metrics.put("hIndex", String.valueOf(stats.path("h_index").asInt()));
        metrics.put("hIndexSince", "");
        metrics.put("i10Index", String.valueOf(stats.path("i10_index").asInt()));
        metrics.put("i10IndexSince", "");
        researcher.put("metrics", metrics);

        JsonNode works = get(API + "/works?filter=author.id:" + shortId
            + "&sort=cited_by_count:desc&per-page=" + MAX_PAPERS
            + "&select=title,authorships,primary_location,publication_year,cited_by_count,doi");
        List<Map<String, String>> papers = new ArrayList<>();
        for (JsonNode w : works.path("results")) {
            String title = w.path("title").asText("").trim();
            if (title.isEmpty()) {
                continue;
            }
            List<String> names = new ArrayList<>();
            JsonNode auth = w.path("authorships");
            for (int i = 0; i < auth.size() && i < 4; i++) {
                names.add(auth.get(i).path("author").path("display_name").asText());
            }
            String authors = String.join(", ", names) + (auth.size() > 4 ? ", ..." : "");
            Map<String, String> p = new LinkedHashMap<>();
            p.put("title", title);
            p.put("authors", authors);
            p.put("venue", w.path("primary_location").path("source").path("display_name").asText(""));
            p.put("year", w.path("publication_year").isNull() ? "" : w.path("publication_year").asText(""));
            p.put("citedBy", String.valueOf(w.path("cited_by_count").asInt()));
            p.put("url", w.path("doi").asText(""));
            papers.add(p);
        }
        researcher.put("publications", papers);

        JsonNode inst = a.path("last_known_institutions");
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("name", a.path("display_name").asText(""));
        result.put("affiliation", inst.isArray() && inst.size() > 0 ? inst.get(0).path("display_name").asText("") : "");
        result.put("researcher", researcher);
        return result;
    }

    private JsonNode get(String url) {
        HttpRequest request = HttpRequest.newBuilder(URI.create(url))
            .timeout(Duration.ofSeconds(15))
            .header("Accept", "application/json")
            .header("User-Agent", "KadiMojaProfileImport/1.0")
            .GET()
            .build();
        try {
            HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() == 404) {
                throw new ResponseStatusException(HttpStatus.NOT_FOUND,
                    "No researcher with that ORCID / OpenAlex id was found on OpenAlex.");
            }
            if (response.statusCode() != 200) {
                throw new ResponseStatusException(HttpStatus.BAD_GATEWAY,
                    "OpenAlex responded with status " + response.statusCode() + ". Try again later.");
            }
            return mapper.readTree(response.body());
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "The OpenAlex request was interrupted.");
        } catch (IOException e) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Couldn't reach OpenAlex. Try again later.");
        }
    }
}
