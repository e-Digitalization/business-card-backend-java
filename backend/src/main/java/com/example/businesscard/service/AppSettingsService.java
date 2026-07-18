package com.example.businesscard.service;

import com.example.businesscard.entity.AppSetting;
import com.example.businesscard.repository.AppSettingRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Optional;

@Service
public class AppSettingsService {
    public static final String OPENAI_API_KEY = "openai.api_key";
    public static final String OPENAI_MODEL = "openai.model";
    public static final String GEMINI_API_KEY = "gemini.api_key";
    public static final String GEMINI_MODEL = "gemini.model";
    public static final String GOOGLE_CLIENT_ID = "google.client_id";

    public static final String SELCOM_BASE_URL = "selcom.base_url";
    public static final String SELCOM_API_KEY = "selcom.api_key";
    public static final String SELCOM_API_SECRET = "selcom.api_secret";
    public static final String SELCOM_VENDOR = "selcom.vendor";
    public static final String SELCOM_AMOUNT_TZS = "selcom.amount_tzs";
    public static final String SELCOM_CURRENCY = "selcom.currency";
    public static final String SELCOM_MOCK = "selcom.mock";

    public static final String AZAMPAY_APP_NAME = "azampay.app_name";
    public static final String AZAMPAY_CLIENT_ID = "azampay.client_id";
    public static final String AZAMPAY_CLIENT_SECRET = "azampay.client_secret";
    public static final String AZAMPAY_API_KEY = "azampay.api_key";
    public static final String AZAMPAY_ENV = "azampay.env";
    public static final String AZAMPAY_ENABLED = "azampay.enabled";

    public static final String PAYMENTS_ACTIVE_PROVIDER = "payments.active_provider";

    private final AppSettingRepository appSettingRepository;

    private final String envOpenaiKey;
    private final String envOpenaiModel;
    private final String envGeminiKey;
    private final String envGeminiModel;
    private final String envGoogleClientId;

    private final String envSelcomBaseUrl;
    private final String envSelcomApiKey;
    private final String envSelcomApiSecret;
    private final String envSelcomVendor;
    private final String envSelcomAmountTzs;
    private final String envSelcomCurrency;
    private final String envSelcomMock;

    private final String envAzampayAppName;
    private final String envAzampayClientId;
    private final String envAzampayClientSecret;
    private final String envAzampayApiKey;
    private final String envAzampayEnv;

    public AppSettingsService(
        AppSettingRepository appSettingRepository,
        @Value("${app.ai.openai.api-key:}") String envOpenaiKey,
        @Value("${app.ai.openai.model:gpt-4o-mini}") String envOpenaiModel,
        @Value("${app.ai.gemini.api-key:}") String envGeminiKey,
        @Value("${app.ai.gemini.model:gemini-2.0-flash}") String envGeminiModel,
        @Value("${app.google.client-id:}") String envGoogleClientId,
        @Value("${app.selcom.base-url:https://apigw.selcommobile.com}") String envSelcomBaseUrl,
        @Value("${app.selcom.api-key:}") String envSelcomApiKey,
        @Value("${app.selcom.api-secret:}") String envSelcomApiSecret,
        @Value("${app.selcom.vendor:}") String envSelcomVendor,
        @Value("${app.selcom.amount-tzs:10000}") String envSelcomAmountTzs,
        @Value("${app.selcom.currency:TZS}") String envSelcomCurrency,
        @Value("${app.selcom.mock:false}") String envSelcomMock,
        @Value("${app.azampay.app-name:}") String envAzampayAppName,
        @Value("${app.azampay.client-id:}") String envAzampayClientId,
        @Value("${app.azampay.client-secret:}") String envAzampayClientSecret,
        @Value("${app.azampay.api-key:}") String envAzampayApiKey,
        @Value("${app.azampay.env:sandbox}") String envAzampayEnv
    ) {
        this.appSettingRepository = appSettingRepository;
        this.envOpenaiKey = blankToNull(envOpenaiKey);
        this.envOpenaiModel = blankToNull(envOpenaiModel);
        this.envGeminiKey = blankToNull(envGeminiKey);
        this.envGeminiModel = blankToNull(envGeminiModel);
        this.envGoogleClientId = blankToNull(envGoogleClientId);
        this.envSelcomBaseUrl = blankToNull(envSelcomBaseUrl);
        this.envSelcomApiKey = blankToNull(envSelcomApiKey);
        this.envSelcomApiSecret = blankToNull(envSelcomApiSecret);
        this.envSelcomVendor = blankToNull(envSelcomVendor);
        this.envSelcomAmountTzs = blankToNull(envSelcomAmountTzs);
        this.envSelcomCurrency = blankToNull(envSelcomCurrency);
        this.envSelcomMock = blankToNull(envSelcomMock);
        this.envAzampayAppName = blankToNull(envAzampayAppName);
        this.envAzampayClientId = blankToNull(envAzampayClientId);
        this.envAzampayClientSecret = blankToNull(envAzampayClientSecret);
        this.envAzampayApiKey = blankToNull(envAzampayApiKey);
        this.envAzampayEnv = blankToNull(envAzampayEnv);
    }

    public String openaiApiKey() {
        return resolve(OPENAI_API_KEY, envOpenaiKey);
    }

    public String openaiModel() {
        String model = resolve(OPENAI_MODEL, envOpenaiModel);
        return model == null ? "gpt-4o-mini" : model;
    }

    public String geminiApiKey() {
        return resolve(GEMINI_API_KEY, envGeminiKey);
    }

    public String geminiModel() {
        String model = resolve(GEMINI_MODEL, envGeminiModel);
        return model == null ? "gemini-2.0-flash" : model;
    }

    public String googleClientId() {
        return resolve(GOOGLE_CLIENT_ID, envGoogleClientId);
    }

    public String selcomBaseUrl() {
        String url = resolve(SELCOM_BASE_URL, envSelcomBaseUrl);
        return url == null ? "https://apigw.selcommobile.com" : trimSlash(url);
    }

    public String selcomApiKey() {
        return resolve(SELCOM_API_KEY, envSelcomApiKey);
    }

    public String selcomApiSecret() {
        return resolve(SELCOM_API_SECRET, envSelcomApiSecret);
    }

    public String selcomVendor() {
        return resolve(SELCOM_VENDOR, envSelcomVendor);
    }

    public int selcomAmountTzs() {
        String raw = resolve(SELCOM_AMOUNT_TZS, envSelcomAmountTzs);
        try {
            return raw == null ? 10000 : Integer.parseInt(raw.trim());
        } catch (NumberFormatException e) {
            return 10000;
        }
    }

    public String selcomCurrency() {
        String currency = resolve(SELCOM_CURRENCY, envSelcomCurrency);
        return currency == null ? "TZS" : currency;
    }

    public boolean selcomForceMock() {
        String raw = resolve(SELCOM_MOCK, envSelcomMock);
        return raw != null && Boolean.parseBoolean(raw.trim());
    }

    public boolean selcomLiveConfigured() {
        return !selcomForceMock()
            && selcomApiKey() != null
            && selcomApiSecret() != null
            && selcomVendor() != null;
    }

    public String azampayAppName() {
        return resolve(AZAMPAY_APP_NAME, envAzampayAppName);
    }

    public String azampayClientId() {
        return resolve(AZAMPAY_CLIENT_ID, envAzampayClientId);
    }

    public String azampayClientSecret() {
        return resolve(AZAMPAY_CLIENT_SECRET, envAzampayClientSecret);
    }

    public String azampayApiKey() {
        return resolve(AZAMPAY_API_KEY, envAzampayApiKey);
    }

    public String azampayEnv() {
        String env = resolve(AZAMPAY_ENV, envAzampayEnv);
        return env == null ? "sandbox" : env;
    }

    public boolean azampayEnabled() {
        String raw = resolve(AZAMPAY_ENABLED, null);
        if (raw != null) return Boolean.parseBoolean(raw.trim());
        return azampayConfigured();
    }

    public boolean azampayConfigured() {
        return azampayAppName() != null
            && azampayClientId() != null
            && azampayClientSecret() != null
            && azampayApiKey() != null;
    }

    public String paymentsActiveProvider() {
        String provider = resolve(PAYMENTS_ACTIVE_PROVIDER, "selcom");
        return provider == null ? "selcom" : provider.toLowerCase();
    }

    public Map<String, Object> adminSnapshot() {
        String openaiKey = openaiApiKey();
        String geminiKey = geminiApiKey();
        String googleId = googleClientId();

        Map<String, Object> openai = new LinkedHashMap<>();
        openai.put("configured", openaiKey != null);
        openai.put("source", sourceOf(OPENAI_API_KEY, envOpenaiKey));
        openai.put("maskedKey", maskSecret(openaiKey));
        openai.put("model", openaiModel());
        openai.put("modelSource", sourceOf(OPENAI_MODEL, envOpenaiModel));

        Map<String, Object> gemini = new LinkedHashMap<>();
        gemini.put("configured", geminiKey != null);
        gemini.put("source", sourceOf(GEMINI_API_KEY, envGeminiKey));
        gemini.put("maskedKey", maskSecret(geminiKey));
        gemini.put("model", geminiModel());

        Map<String, Object> google = new LinkedHashMap<>();
        google.put("configured", googleId != null);
        google.put("source", sourceOf(GOOGLE_CLIENT_ID, envGoogleClientId));
        google.put("clientId", googleId);
        google.put("maskedClientId", maskSecret(googleId));

        Map<String, Object> scan = new LinkedHashMap<>();
        scan.put("enabled", openaiKey != null || geminiKey != null);
        scan.put("activeProvider", openaiKey != null ? "openai" : (geminiKey != null ? "gemini" : "none"));

        Map<String, Object> selcom = new LinkedHashMap<>();
        selcom.put("configured", selcomLiveConfigured());
        selcom.put("apiKeySource", sourceOf(SELCOM_API_KEY, envSelcomApiKey));
        selcom.put("apiSecretSource", sourceOf(SELCOM_API_SECRET, envSelcomApiSecret));
        selcom.put("vendorSource", sourceOf(SELCOM_VENDOR, envSelcomVendor));
        selcom.put("maskedApiKey", maskSecret(selcomApiKey()));
        selcom.put("maskedApiSecret", maskSecret(selcomApiSecret()));
        selcom.put("vendor", selcomVendor());
        selcom.put("baseUrl", selcomBaseUrl());
        selcom.put("amountTzs", selcomAmountTzs());
        selcom.put("currency", selcomCurrency());
        selcom.put("forceMock", selcomForceMock());
        selcom.put("mode", selcomLiveConfigured() ? "live" : "demo");

        Map<String, Object> azampay = new LinkedHashMap<>();
        azampay.put("configured", azampayConfigured());
        azampay.put("enabled", azampayEnabled());
        azampay.put("appName", azampayAppName());
        azampay.put("clientIdSource", sourceOf(AZAMPAY_CLIENT_ID, envAzampayClientId));
        azampay.put("clientSecretSource", sourceOf(AZAMPAY_CLIENT_SECRET, envAzampayClientSecret));
        azampay.put("apiKeySource", sourceOf(AZAMPAY_API_KEY, envAzampayApiKey));
        azampay.put("maskedClientId", maskSecret(azampayClientId()));
        azampay.put("maskedClientSecret", maskSecret(azampayClientSecret()));
        azampay.put("maskedApiKey", maskSecret(azampayApiKey()));
        azampay.put("env", azampayEnv());
        azampay.put("status", azampayConfigured() ? "ready" : "not_configured");

        Map<String, Object> payments = new LinkedHashMap<>();
        payments.put("activeProvider", paymentsActiveProvider());
        payments.put("providers", new String[]{"selcom", "azampay"});

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("openai", openai);
        data.put("gemini", gemini);
        data.put("google", google);
        data.put("scan", scan);
        data.put("selcom", selcom);
        data.put("azampay", azampay);
        data.put("payments", payments);
        data.put("hint", "Values saved here override .env until cleared. Secrets are never shown in full.");
        return data;
    }

    @Transactional
    public Map<String, Object> updateFromAdmin(Map<String, Object> body) {
        if (body == null) body = Map.of();

        applySecret(OPENAI_API_KEY, body.get("openaiApiKey"));
        applyPlain(OPENAI_MODEL, body.get("openaiModel"));
        applySecret(GEMINI_API_KEY, body.get("geminiApiKey"));
        applyPlain(GEMINI_MODEL, body.get("geminiModel"));
        applyPlain(GOOGLE_CLIENT_ID, body.get("googleClientId"));

        applyPlain(SELCOM_BASE_URL, body.get("selcomBaseUrl"));
        applySecret(SELCOM_API_KEY, body.get("selcomApiKey"));
        applySecret(SELCOM_API_SECRET, body.get("selcomApiSecret"));
        applyPlain(SELCOM_VENDOR, body.get("selcomVendor"));
        applyPlain(SELCOM_AMOUNT_TZS, body.get("selcomAmountTzs"));
        applyPlain(SELCOM_CURRENCY, body.get("selcomCurrency"));
        if (body.containsKey("selcomForceMock")) {
            applyPlain(SELCOM_MOCK, String.valueOf(Boolean.TRUE.equals(body.get("selcomForceMock"))
                || "true".equalsIgnoreCase(String.valueOf(body.get("selcomForceMock")))));
        }

        applyPlain(AZAMPAY_APP_NAME, body.get("azampayAppName"));
        applySecret(AZAMPAY_CLIENT_ID, body.get("azampayClientId"));
        applySecret(AZAMPAY_CLIENT_SECRET, body.get("azampayClientSecret"));
        applySecret(AZAMPAY_API_KEY, body.get("azampayApiKey"));
        applyPlain(AZAMPAY_ENV, body.get("azampayEnv"));
        if (body.containsKey("azampayEnabled")) {
            applyPlain(AZAMPAY_ENABLED, String.valueOf(Boolean.TRUE.equals(body.get("azampayEnabled"))
                || "true".equalsIgnoreCase(String.valueOf(body.get("azampayEnabled")))));
        }

        applyPlain(PAYMENTS_ACTIVE_PROVIDER, body.get("paymentsActiveProvider"));

        clearIf(body, "clearOpenaiApiKey", OPENAI_API_KEY);
        clearIf(body, "clearGeminiApiKey", GEMINI_API_KEY);
        clearIf(body, "clearGoogleClientId", GOOGLE_CLIENT_ID);
        clearIf(body, "clearSelcomApiKey", SELCOM_API_KEY);
        clearIf(body, "clearSelcomApiSecret", SELCOM_API_SECRET);
        clearIf(body, "clearSelcomVendor", SELCOM_VENDOR);
        clearIf(body, "clearAzampayClientId", AZAMPAY_CLIENT_ID);
        clearIf(body, "clearAzampayClientSecret", AZAMPAY_CLIENT_SECRET);
        clearIf(body, "clearAzampayApiKey", AZAMPAY_API_KEY);

        return adminSnapshot();
    }

    private void clearIf(Map<String, Object> body, String flag, String key) {
        if (Boolean.TRUE.equals(body.get(flag))) {
            clear(key);
        }
    }

    private void applySecret(String key, Object raw) {
        if (raw == null) return;
        String value = String.valueOf(raw).trim();
        if (value.isEmpty()) {
            clear(key);
            return;
        }
        if (looksMasked(value)) return;
        put(key, value);
    }

    private void applyPlain(String key, Object raw) {
        if (raw == null) return;
        String value = String.valueOf(raw).trim();
        if (value.isEmpty()) {
            clear(key);
            return;
        }
        put(key, value);
    }

    private void put(String key, String value) {
        AppSetting setting = appSettingRepository.findById(key).orElseGet(AppSetting::new);
        setting.setKey(key);
        setting.setValue(value);
        setting.setUpdatedAt(Instant.now());
        appSettingRepository.save(setting);
    }

    private void clear(String key) {
        appSettingRepository.deleteById(key);
    }

    private String resolve(String key, String envDefault) {
        Optional<AppSetting> stored = appSettingRepository.findById(key);
        if (stored.isPresent()) {
            return blankToNull(stored.get().getValue());
        }
        return envDefault;
    }

    private String sourceOf(String key, String envDefault) {
        if (appSettingRepository.existsById(key)) return "database";
        if (envDefault != null) return "environment";
        return "unset";
    }

    public static String maskSecret(String value) {
        if (value == null || value.isBlank()) return null;
        String v = value.trim();
        if (v.length() <= 8) return "••••••••";
        return v.substring(0, Math.min(7, v.length())) + "…••••" + v.substring(v.length() - 4);
    }

    private static boolean looksMasked(String value) {
        return value.contains("…") || value.contains("••••") || value.contains("****");
    }

    private static String blankToNull(String value) {
        if (value == null || value.isBlank()) return null;
        return value.trim();
    }

    private static String trimSlash(String value) {
        if (value == null) return null;
        String v = value.trim();
        while (v.endsWith("/")) {
            v = v.substring(0, v.length() - 1);
        }
        return v.isEmpty() ? null : v;
    }
}
