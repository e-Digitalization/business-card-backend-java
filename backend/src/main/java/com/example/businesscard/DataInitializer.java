package com.example.businesscard;

import com.example.businesscard.entity.AdminUser;
import com.example.businesscard.entity.Card;
import com.example.businesscard.entity.CardTag;
import com.example.businesscard.repository.AdminUserRepository;
import com.example.businesscard.repository.CardRepository;
import com.example.businesscard.repository.CardTagRepository;
import com.example.businesscard.service.PrivateSlugService;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {
    private final CardRepository cardRepository;
    private final CardTagRepository cardTagRepository;
    private final AdminUserRepository adminUserRepository;
    private final PasswordEncoder passwordEncoder;
    private final PrivateSlugService privateSlugService;

    public DataInitializer(CardRepository cardRepository,
                           CardTagRepository cardTagRepository,
                           AdminUserRepository adminUserRepository,
                           PasswordEncoder passwordEncoder,
                           PrivateSlugService privateSlugService) {
        this.cardRepository = cardRepository;
        this.cardTagRepository = cardTagRepository;
        this.adminUserRepository = adminUserRepository;
        this.passwordEncoder = passwordEncoder;
        this.privateSlugService = privateSlugService;
    }

    @Override
    public void run(String... args) {
        seedAdminUser();
        migrateGuessableSlugs();
        seedSampleCards();
    }

    private void seedAdminUser() {
        if (adminUserRepository.findByUsername("admin").isPresent()) {
            return;
        }
        AdminUser admin = new AdminUser();
        admin.setUsername("admin");
        admin.setPasswordHash(passwordEncoder.encode("admin123"));
        adminUserRepository.save(admin);
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
        card.setActive(true);
        Card saved = cardRepository.save(card);

        CardTag tag = new CardTag();
        tag.setTagCode(tagCode);
        tag.setCard(saved);
        tag.setActive(true);
        cardTagRepository.save(tag);
    }
}
