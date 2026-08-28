package com.example.businesscard.service;

import com.example.businesscard.dto.ClientAuthResponse;
import com.example.businesscard.dto.ClientLoginRequest;
import com.example.businesscard.dto.ClientRegisterRequest;
import com.example.businesscard.entity.Card;
import com.example.businesscard.entity.ClientUser;
import com.example.businesscard.repository.CardRepository;
import com.example.businesscard.repository.ClientUserRepository;
import com.example.businesscard.security.JwtTokenProvider;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.Locale;

@Service
public class ClientAuthService {
    private final ClientUserRepository clientUserRepository;
    private final CardRepository cardRepository;
    private final GoogleTokenVerifier googleTokenVerifier;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;
    private final PrivateSlugService privateSlugService;
    private final CardInviteService cardInviteService;

    public ClientAuthService(ClientUserRepository clientUserRepository,
                             CardRepository cardRepository,
                             GoogleTokenVerifier googleTokenVerifier,
                             PasswordEncoder passwordEncoder,
                             JwtTokenProvider tokenProvider,
                             PrivateSlugService privateSlugService,
                             CardInviteService cardInviteService) {
        this.clientUserRepository = clientUserRepository;
        this.cardRepository = cardRepository;
        this.googleTokenVerifier = googleTokenVerifier;
        this.passwordEncoder = passwordEncoder;
        this.tokenProvider = tokenProvider;
        this.privateSlugService = privateSlugService;
        this.cardInviteService = cardInviteService;
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

    @Transactional
    public ClientAuthResponse register(ClientRegisterRequest request) {
        String email = request.getEmail().trim().toLowerCase(Locale.ROOT);
        if (clientUserRepository.findByEmailIgnoreCase(email).isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "An account with this email already exists.");
        }

        ClientUser user = new ClientUser();
        user.setEmail(email);
        user.setFullName(request.getFullName().trim());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        ensureCard(user, false);
        clientUserRepository.save(user);
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
