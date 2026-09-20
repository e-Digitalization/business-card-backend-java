package com.example.businesscard.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.Test;
import org.springframework.web.server.ResponseStatusException;

class ScholarImportServiceTest {
    // Histogram markup captured from a real Scholar profile: 2018 and 2019 have no bar
    // (zero citations), so counts must be matched to years by position, not by order.
    private static final String HISTOGRAM =
        "<div class=\"gsc_md_hist_b\"><span class=\"gsc_g_t\" style=\"right:259px\">2017</span><span class=\"gsc_g_t\" style=\"right:227px\">2018</span><span class=\"gsc_g_t\" style=\"right:195px\">2019</span><span class=\"gsc_g_t\" style=\"right:163px\">2020</span><span class=\"gsc_g_t\" style=\"right:131px\">2021</span><span class=\"gsc_g_t\" style=\"right:99px\">2022</span><span class=\"gsc_g_t\" style=\"right:67px\">2023</span><span class=\"gsc_g_t\" style=\"right:35px\">2024</span><span class=\"gsc_g_t\" style=\"right:3px\">2025</span><a href=\"javascript:void(0)\" class=\"gsc_g_a\" style=\"right:264px;top:134px;height:26px;z-index:9\"><span class=\"gsc_g_al\">1</span></a><a href=\"javascript:void(0)\" class=\"gsc_g_a\" style=\"right:168px;top:27px;height:133px;z-index:6\"><span class=\"gsc_g_al\">5</span></a><a href=\"javascript:void(0)\" class=\"gsc_g_a\" style=\"right:136px;top:107px;height:53px;z-index:5\"><span class=\"gsc_g_al\">2</span></a><a href=\"javascript:void(0)\" class=\"gsc_g_a\" style=\"right:104px;top:80px;height:80px;z-index:4\"><span class=\"gsc_g_al\">3</span></a><a href=\"javascript:void(0)\" class=\"gsc_g_a\" style=\"right:72px;top:134px;height:26px;z-index:3\"><span class=\"gsc_g_al\">1</span></a><a href=\"javascript:void(0)\" class=\"gsc_g_a\" style=\"right:40px;top:134px;height:26px;z-index:2\"><span class=\"gsc_g_al\">1</span></a><a href=\"javascript:void(0)\" class=\"gsc_g_a\" style=\"right:8px;top:107px;height:53px;z-index:1\"><span class=\"gsc_g_al\">2</span></a>";

    private static final String PAGE = "<div id=\"gsc_prf_in\">Some Author</div>"
        + "<table id=\"gsc_rsb_st\"><thead><tr><th class=\"gsc_rsb_sth\"></th><th class=\"gsc_rsb_sth\">All</th>"
        + "<th class=\"gsc_rsb_sth\">Since 2021</th></tr></thead></table>"
        + HISTOGRAM + "</div></div>";

    @SuppressWarnings("unchecked")
    @Test
    void matchesCitationBarsToYearsByPosition() {
        Map<String, Object> result = new ScholarImportService().parseProfile(PAGE, "https://scholar.google.com/citations?user=x");
        Map<String, Object> researcher = (Map<String, Object>) result.get("researcher");
        List<Map<String, Object>> byYear = (List<Map<String, Object>>) researcher.get("citationsByYear");

        assertEquals(9, byYear.size());
        int[] expected = {1, 0, 0, 5, 2, 3, 1, 1, 2}; // 2017..2025
        for (int i = 0; i < expected.length; i++) {
            assertEquals(String.valueOf(2017 + i), byYear.get(i).get("year"));
            assertEquals(expected[i], byYear.get(i).get("count"), "year " + (2017 + i));
        }
        assertEquals("2021", researcher.get("sinceYear"));
    }

    @Test
    void acceptsOnlyScholarProfileLinks() {
        assertEquals("cA16lNcAAAAJ", ScholarImportService.extractUserId("https://scholar.google.com/citations?user=cA16lNcAAAAJ&hl=en"));
        assertThrows(ResponseStatusException.class, () -> ScholarImportService.extractUserId("https://scholar.google.com.evil.com/citations?user=cA16lNcAAAAJ"));
        assertThrows(ResponseStatusException.class, () -> ScholarImportService.extractUserId("https://scholar.google.com/citations?hl=en"));
    }
}
