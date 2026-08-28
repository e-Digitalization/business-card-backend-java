package com.example.businesscard.service;

import com.example.businesscard.dto.ClientAuthResponse;
import com.example.businesscard.dto.ClientLoginRequest;
import com.example.businesscard.dto.ClientRegisterRequest;
import com.example.businesscard.entity.Card;
import com.example.businesscard.entity.ClientUser;
import com.example.businesscard.entity.EmailVerification;
import com.example.businesscard.repository.CardRepository;
import com.example.businesscard.repository.ClientUserRepository;
import com.example.businesscard.repository.EmailVerificationRepository;
import com.example.businesscard.security.JwtTokenProvider;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.security.SecureRandom;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.LinkedHashMap;
import java.util.Locale;
import java.util.Map;

@Service
public class ClientAuthService {
    private static final Logger log = LoggerFactory.getLogger(ClientAuthService.class);
    private static final SecureRandom OTP_RANDOM = new SecureRandom();
    private static final int MAX_OTP_ATTEMPTS = 6;

    private final ClientUserRepository clientUserRepository;
    private final CardRepository cardRepository;
    private final GoogleTokenVerifier googleTokenVerifier;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;
    private final PrivateSlugService privateSlugService;
    private final CardInviteService cardInviteService;
    private final EmailVerificationRepository emailVerificationRepository;
    private final EmailService emailService;
    private final int otpTtlMinutes;

    public ClientAuthService(ClientUserRepository clientUserRepository,
                             CardRepository cardRepository,
                             GoogleTokenVerifier googleTokenVerifier,
                             PasswordEncoder passwordEncoder,
                             JwtTokenProvider tokenProvider,
                             PrivateSlugService privateSlugService,
                             CardInviteService cardInviteService,
                             EmailVerificationRepository emailVerificationRepository,
                             EmailService emailService,
                             @Value("${app.auth.otp.ttl-minutes:15}") int otpTtlMinutes) {
        this.clientUserRepository = clientUserRepository;
        this.cardRepository = cardRepository;
        this.googleTokenVerifier = googleTokenVerifier;
        this.passwordEncoder = passwordEncoder;
        this.tokenProvider = tokenProvider;
        this.privateSlugService = privateSlugService;
        this.cardInviteService = cardInviteService;
        this.emailVerificationRepository = emailVerificationRepository;
        this.emailService = emailService;
        this.otpTtlMinutes = otpTtlMinutes > 0 ? otpTtlMinutes : 15;
    }

    public boolean isGoogleConfigured() {
        return googleTokenVerifier.isConfigured();
    }

    public String googleClientId() {
        return googleTokenVerifier.clientId();
    }

    @Transactional
    public ClientAuthResponse loginWithGoogle(String idToken) {
        GoogleTokenVerifier.GoogleProfile profile = googleTokenVerifier.verify(idToken);

        ClientUser user = clientUserRepository.findByGoogleSub(profile.sub())
            .or(() -> clientUserRepository.findByEmailIgnoreCase(profile.email()))
            .orElseGet(ClientUser::new);

        user.setGoogleSub(profile.sub());
        user.setEmail(profile.email().toLowerCase(Locale.ROOT));
        if (profile.name() != null && !profile.name().isBlank()) {
            user.setFullName(profile.name());
        } else if (user.getFullName() == null || user.getFullName().isBlank()) {
            user.setFullName(profile.email().split("@")[0]);
        }
        if (profile.pictureUrl() != null && !profile.pictureUrl().isBlank()) {
            user.setPictureUrl(profile.pictureUrl());
        }

        ensureCard(user, true);
        clientUserRepository.save(user);
        return toAuthResponse(user);
    }

    /**
     * Step 1 of email/password sign-up: stash the details and email a one-time
     * code. No {@link ClientUser} exists until {@link #verifyRegistration}.
     */
    @Transactional
    public Map<String, Object> startRegistration(ClientRegisterRequest request) {
        String email = request.getEmail().trim().toLowerCase(Locale.ROOT);
        String fullName = request.getFullName() == null ? "" : request.getFullName().trim();
        if (fullName.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Full name is required.");
        }
        if (request.getPassword() == null || request.getPassword().length() < 6) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Password must be at least 6 characters.");
        }
        if (clientUserRepository.findByEmailIgnoreCase(email).isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "An account with this email already exists.");
        }

        String otp = String.format("%06d", OTP_RANDOM.nextInt(1_000_000));

        emailVerificationRepository.deletePendingForEmail(email);
        EmailVerification pending = new EmailVerification();
        pending.setEmail(email);
        pending.setFullName(fullName);
        pending.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        pending.setOtpHash(passwordEncoder.encode(otp));
        pending.setExpiresAt(Instant.now().plus(otpTtlMinutes, ChronoUnit.MINUTES));
        emailVerificationRepository.save(pending);

        boolean delivered = emailService.sendVerificationCode(email, otp, otpTtlMinutes);
        if (!delivered) {
            log.warn("Registration OTP for {} (email delivery unavailable): {}", email, otp);
        }

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("email", email);
        result.put("pending", true);
        result.put("delivered", delivered);
        result.put("expiresInMinutes", otpTtlMinutes);
        // Only surface the code when real email delivery is not configured, so
        // the flow is still testable before SMTP credentials are in place.
        result.put("otpPreview", (!delivered && !emailService.isEnabled()) ? otp : null);
        return result;
    }

    /** Step 2: confirm the code and create the real account. */
    @Transactional
    public ClientAuthResponse verifyRegistration(String emailRaw, String otpRaw) {
        String email = emailRaw == null ? "" : emailRaw.trim().toLowerCase(Locale.ROOT);
        String otp = otpRaw == null ? "" : otpRaw.trim();
        if (email.isBlank() || otp.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email and verification code are required.");
        }

        EmailVerification pending = emailVerificationRepository
            .findFirstByEmailIgnoreCaseAndConsumedAtIsNullOrderByCreatedAtDesc(email)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST,
                "No pending sign-up for this email. Start again."));

        if (pending.isExpired()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "This code has expired. Request a new one.");
        }
        if (pending.getAttempts() >= MAX_OTP_ATTEMPTS) {
            throw new ResponseStatusException(HttpStatus.TOO_MANY_REQUESTS,
                "Too many incorrect attempts. Request a new code.");
        }
        if (!passwordEncoder.matches(otp, pending.getOtpHash())) {
            pending.setAttempts(pending.getAttempts() + 1);
            emailVerificationRepository.save(pending);
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Incorrect verification code.");
        }
        if (clientUserRepository.findByEmailIgnoreCase(email).isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "An account with this email already exists.");
        }

        ClientUser user = new ClientUser();
        user.setEmail(email);
        user.setFullName(pending.getFullName());
        user.setPasswordHash(pending.getPasswordHash());
        ensureCard(user, false);
        clientUserRepository.save(user);

        pending.setConsumedAt(Instant.now());
        emailVerificationRepository.save(pending);

        return toAuthResponse(user);
    }

    @Transactional(readOnly = true)
    public ClientAuthResponse login(ClientLoginRequest request) {
        String email = request.getEmail().trim().toLowerCase(Locale.ROOT);
        ClientUser user = clientUserRepository.findByEmailIgnoreCase(email)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid email or password."));

        if (user.getPasswordHash() == null || user.getPasswordHash().isBlank()) {
            throw new ResponseStatusException(
                HttpStatus.UNAUTHORIZED,
                "Account invite pending. Open /claim with your email OTP to set a password."
            );
        }
        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid email or password.");
        }
        return toAuthResponse(user);
    }

    @Transactional(readOnly = true)
    public ClientUser requireUser(Long userId) {
        return clientUserRepository.findById(userId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found."));
    }

    @Transactional
    public Card ensureCard(ClientUser user, boolean applyGooglePhoto) {
        Card card = user.getCard();
        if (card == null) {
            card = cardRepository.findFirstUnclaimedByEmailIgnoreCase(user.getEmail()).orElse(null);
            if (card != null) {
                user.setCard(card);
                if ((user.getFullName() == null || user.getFullName().isBlank())
                    && card.getFullName() != null && !card.getFullName().isBlank()) {
                    user.setFullName(card.getFullName());
                }
                if (applyGooglePhoto && user.getPictureUrl() != null
                    && (card.getPhotoUrl() == null || card.getPhotoUrl().isBlank())) {
                    card.setPhotoUrl(user.getPictureUrl());
                    cardRepository.save(card);
                }
                clientUserRepository.save(user);
                return card;
            }

            card = new Card();
            card.setSlug(privateSlugService.nextUnique());
            card.setFullName(user.getFullName());
            card.setEmail(user.getEmail());
            card.setLocation("Tanzania");
            card.setActive(true);
            if (applyGooglePhoto && user.getPictureUrl() != null) {
                card.setPhotoUrl(user.getPictureUrl());
            }
            card = cardRepository.save(card);
            user.setCard(card);
            clientUserRepository.save(user);
        } else if (applyGooglePhoto && user.getPictureUrl() != null
            && (card.getPhotoUrl() == null || card.getPhotoUrl().isBlank()
            || card.getPhotoUrl().equals(user.getPictureUrl()))) {
            card.setPhotoUrl(user.getPictureUrl());
            cardRepository.save(card);
        }
        return card;
    }

    @Transactional
    public ClientAuthResponse claimInvite(String email, String otp, String password) {
        ClientUser user = cardInviteService.claim(email, otp, password);
        return toAuthResponse(user);
    }

    private ClientAuthResponse toAuthResponse(ClientUser user) {
        String token = tokenProvider.generateToken(
            "client:" + user.getId(),
            "CLIENT",
            user.getId()
        );
        return new ClientAuthResponse(
            token,
            user.getId(),
            user.getEmail(),
            user.getFullName(),
            user.getPictureUrl(),
            user.getCard()
        );
    }
}
