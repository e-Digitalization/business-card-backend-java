package com.example.businesscard.service;

import com.example.businesscard.entity.AccountInvite;
import com.example.businesscard.entity.Card;
import com.example.businesscard.entity.ClientUser;
import com.example.businesscard.repository.AccountInviteRepository;
import com.example.businesscard.repository.CardRepository;
import com.example.businesscard.repository.ClientUserRepository;
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
public class CardInviteService {
    private final CardRepository cardRepository;
    private final ClientUserRepository clientUserRepository;
    private final AccountInviteRepository accountInviteRepository;
    private final PasswordEncoder passwordEncoder;
    private final SecureRandom random = new SecureRandom();

    public CardInviteService(
        CardRepository cardRepository,
        ClientUserRepository clientUserRepository,
        AccountInviteRepository accountInviteRepository,
        PasswordEncoder passwordEncoder
    ) {
        this.cardRepository = cardRepository;
        this.clientUserRepository = clientUserRepository;
        this.accountInviteRepository = accountInviteRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> accountStatus(Card card) {
        Map<String, Object> status = new LinkedHashMap<>();
        ClientUser owner = clientUserRepository.findByCard_Id(card.getId()).orElse(null);
        AccountInvite openInvite = accountInviteRepository.findFirstByCard_IdAndUsedAtIsNullOrderByCreatedAtDesc(card.getId()).orElse(null);

        status.put("hasAccount", owner != null);
        status.put("accountEmail", owner != null ? owner.getEmail() : null);
        status.put("accountName", owner != null ? owner.getFullName() : null);
        status.put("passwordSet", owner != null && owner.getPasswordHash() != null && !owner.getPasswordHash().isBlank());
        status.put("googleLinked", owner != null && owner.getGoogleSub() != null && !owner.getGoogleSub().isBlank());
        status.put("invitePending", openInvite != null && !openInvite.isExpired());
        status.put("inviteExpiresAt", openInvite == null || openInvite.isExpired()
            ? null
            : openInvite.getExpiresAt().toString());
        status.put("canInvite", card.getEmail() != null && !card.getEmail().isBlank());
        return status;
    }

    @Transactional
    public Map<String, Object> createInvite(Long cardId) {
        Card card = cardRepository.findById(cardId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Card not found."));
        if (card.getEmail() == null || card.getEmail().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Add an email on the card before inviting.");
        }

        String email = card.getEmail().trim().toLowerCase(Locale.ROOT);
        ClientUser existing = clientUserRepository.findByEmailIgnoreCase(email).orElse(null);
        if (existing != null) {
            if (existing.getCard() != null && !existing.getCard().getId().equals(card.getId())) {
                throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "That email already owns a different digital card."
                );
            }
            if (existing.getPasswordHash() != null && !existing.getPasswordHash().isBlank()) {
                throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "This person already has login credentials. They can sign in normally."
                );
            }
            existing.setCard(card);
            if (existing.getFullName() == null || existing.getFullName().isBlank()) {
                existing.setFullName(card.getFullName());
            }
            clientUserRepository.save(existing);
        } else {
            ClientUser linked = clientUserRepository.findByCard_Id(card.getId()).orElse(null);
            if (linked != null && !linked.getEmail().equalsIgnoreCase(email)) {
                throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "This card is already linked to " + linked.getEmail()
                );
            }
            if (linked == null) {
                ClientUser user = new ClientUser();
                user.setEmail(email);
                user.setFullName(card.getFullName() == null || card.getFullName().isBlank()
                    ? email.split("@")[0]
                    : card.getFullName());
                user.setCard(card);
                clientUserRepository.save(user);
            }
        }

        accountInviteRepository.findFirstByCard_IdAndUsedAtIsNullOrderByCreatedAtDesc(card.getId()).ifPresent(invite -> {
            invite.setUsedAt(Instant.now());
            accountInviteRepository.save(invite);
        });

        String otp = String.format("%06d", random.nextInt(1_000_000));
        AccountInvite invite = new AccountInvite();
        invite.setCard(card);
        invite.setEmail(email);
        invite.setOtpHash(passwordEncoder.encode(otp));
        invite.setExpiresAt(Instant.now().plus(24, ChronoUnit.HOURS));
        invite.setCreatedAt(Instant.now());
        accountInviteRepository.save(invite);

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("email", email);
        result.put("otp", otp);
        result.put("expiresAt", invite.getExpiresAt().toString());
        result.put("claimPath", "/claim?email=" + email);
        result.put("message", "Share the OTP with the card owner (WhatsApp/SMS/email). They set a password at /claim.");
        result.putAll(accountStatus(card));
        return result;
    }

    @Transactional
    public ClientUser claim(String emailRaw, String otp, String password) {
        if (emailRaw == null || emailRaw.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email is required.");
        }
        if (otp == null || otp.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "OTP code is required.");
        }
        if (password == null || password.length() < 6) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Password must be at least 6 characters.");
        }

        String email = emailRaw.trim().toLowerCase(Locale.ROOT);
        AccountInvite invite = accountInviteRepository.findFirstByEmailIgnoreCaseAndUsedAtIsNullOrderByCreatedAtDesc(email)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "No active invite for this email."));

        if (invite.isExpired()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invite OTP expired. Ask admin to send a new one.");
        }
        if (!passwordEncoder.matches(otp.trim(), invite.getOtpHash())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid OTP code.");
        }

        Card card = invite.getCard();
        ClientUser user = clientUserRepository.findByEmailIgnoreCase(email)
            .orElseGet(ClientUser::new);
        if (user.getId() == null) {
            user.setEmail(email);
            user.setFullName(card.getFullName());
        }
        if (user.getCard() != null && !user.getCard().getId().equals(card.getId())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email is linked to another card.");
        }

        user.setCard(card);
        user.setPasswordHash(passwordEncoder.encode(password));
        if (user.getFullName() == null || user.getFullName().isBlank()) {
            user.setFullName(card.getFullName());
        }
        clientUserRepository.save(user);

        invite.setUsedAt(Instant.now());
        accountInviteRepository.save(invite);

        return user;
    }
}
