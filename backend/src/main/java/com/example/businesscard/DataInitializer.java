package com.example.businesscard;

import com.example.businesscard.entity.AdminUser;
import com.example.businesscard.entity.Card;
import com.example.businesscard.entity.CardTag;
import com.example.businesscard.repository.AdminUserRepository;
import com.example.businesscard.repository.CardRepository;
import com.example.businesscard.repository.CardTagRepository;
import com.example.businesscard.service.PrivateSlugService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.security.SecureRandom;
import java.util.Base64;

@Component
public class DataInitializer implements CommandLineRunner {
    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    private final CardRepository cardRepository;
    private final CardTagRepository cardTagRepository;
    private final AdminUserRepository adminUserRepository;
    private final PasswordEncoder passwordEncoder;
    private final PrivateSlugService privateSlugService;
    private final String defaultAdminUsername;
    private final String defaultAdminPassword;

    public DataInitializer(CardRepository cardRepository,
                           CardTagRepository cardTagRepository,
                           AdminUserRepository adminUserRepository,
                           PasswordEncoder passwordEncoder,
                           PrivateSlugService privateSlugService,
                           @Value("${app.admin.default-username:}") String defaultAdminUsername,
                           @Value("${app.admin.default-password:}") String defaultAdminPassword) {
        this.cardRepository = cardRepository;
        this.cardTagRepository = cardTagRepository;
        this.adminUserRepository = adminUserRepository;
        this.passwordEncoder = passwordEncoder;
        this.privateSlugService = privateSlugService;
        this.defaultAdminUsername = defaultAdminUsername;
        this.defaultAdminPassword = defaultAdminPassword;
    }

    @Override
    public void run(String... args) {
        seedAdminUser();
        migrateGuessableSlugs();
        seedSampleCards();
    }

    private void seedAdminUser() {
        if (adminUserRepository.count() > 0) {
            return;
        }

        String username = defaultAdminUsername.isBlank() ? "admin" : defaultAdminUsername;
        String password = defaultAdminPassword.isBlank() ? generateRandomPassword() : defaultAdminPassword;

        AdminUser admin = new AdminUser();
        admin.setUsername(username);
        admin.setPasswordHash(passwordEncoder.encode(password));
        adminUserRepository.save(admin);

        if (defaultAdminPassword.isBlank()) {
            log.warn("No ADMIN_USERNAME/ADMIN_PASSWORD configured — created initial admin user '{}' with generated password: {}. " +
                    "Log in and rotate this immediately, or set ADMIN_USERNAME/ADMIN_PASSWORD before first boot.", username, password);
        } else {
            log.info("Created initial admin user '{}' from configured ADMIN_USERNAME/ADMIN_PASSWORD.", username);
        }
    }

    private String generateRandomPassword() {
        byte[] bytes = new byte[18];
        new SecureRandom().nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    private void migrateGuessableSlugs() {
        for (Card card : cardRepository.findAll()) {
            if (privateSlugService.isGuessable(card.getSlug())) {
                card.setSlug(privateSlugService.nextUnique());
                cardRepository.save(card);
            }
        }
    }

    private void seedSampleCards() {
        seedCard(
            "Japhari Mbaru",
            "Founder & Systems Architect",
            "Swahili Systems",
            "Dar es Salaam, Tanzania",
            "+255 714 076 404",
            "japhari@swahilisystems.com",
            "https://swahilisystems.com",
            "+255714076404",
            "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
            "/logos/swahili-systems.svg",
            "TAG12345"
        );
        seedCard(
            "Amina Kassim",
            "Product Lead",
            "Swahili Systems",
            "Dar es Salaam, Tanzania",
            "+255 754 221 100",
            "amina@swahilisystems.com",
            "https://swahilisystems.com",
            "+255754221100",
            "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=400&q=80",
            "/logos/swahili-systems.svg",
            "TAG67890"
        );
        seedCard(
            "David Mwakyusa",
            "Sales Director",
            "Safiri Logistics",
            "Arusha, Tanzania",
            "+255 762 334 455",
            "david@safirilogs.co.tz",
            "https://safirilogs.co.tz",
            "+255762334455",
            "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&q=80",
            "/logos/ealogistics.svg",
            "TAG-DAVID"
        );
        seedCard(
            "Grace Kimaro",
            "Creative Director",
            "Studio Bahari",
            "Zanzibar, Tanzania",
            "+255 777 889 900",
            "grace@studiobahari.co.tz",
            "https://studiobahari.co.tz",
            "+255777889900",
            "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80",
            "/logos/studio-bahari.svg",
            "TAG-GRACE"
        );
        seedCard(
            "James Mwakasege",
            "Head of Engineering",
            "FinLink Tanzania",
            "Mwanza, Tanzania",
            "+255 688 112 233",
            "james@finlink.co.tz",
            "https://finlink.co.tz",
            "+255688112233",
            "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=400&q=80",
            "/logos/finlink.svg",
            "TAG-JAMES"
        );
        seedCard(
            "Neema Hassan",
            "Brand Strategist",
            "Coastal Collective",
            "Dodoma, Tanzania",
            "+255 755 667 788",
            "neema@coastal.co.tz",
            "https://coastal.co.tz",
            "+255755667788",
            "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=400&q=80",
            "/logos/coastal.svg",
            "TAG-NEEMA"
        );
    }

    private void seedCard(String fullName,
                          String title,
                          String company,
                          String location,
                          String phone,
                          String email,
                          String website,
                          String whatsapp,
                          String photoUrl,
                          String logoUrl,
                          String tagCode) {
        if (cardTagRepository.findByTagCode(tagCode).isPresent()) {
            return;
        }

        Card card = new Card();
        card.setSlug(privateSlugService.nextUnique());
        card.setFullName(fullName);
        card.setTitle(title);
        card.setCompany(company);
        card.setLocation(location);
        card.setPhone(phone);
        card.setEmail(email);
        card.setWebsite(website);
        card.setWhatsapp(whatsapp);
        card.setPhotoUrl(photoUrl);
        card.setLogoUrl(logoUrl);
        card.setLinkedin("https://www.linkedin.com");
        card.setTwitter("https://twitter.com");
        card.setGithub("https://github.com");
        card.setInstagram("https://instagram.com");
        card.setActive(true);
        Card saved = cardRepository.save(card);

        CardTag tag = new CardTag();
        tag.setTagCode(tagCode);
        tag.setCard(saved);
        tag.setActive(true);
        cardTagRepository.save(tag);
    }
}
