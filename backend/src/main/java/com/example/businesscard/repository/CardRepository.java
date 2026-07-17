package com.example.businesscard.repository;

import com.example.businesscard.entity.Card;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface CardRepository extends JpaRepository<Card, Long> {
    Optional<Card> findBySlug(String slug);

    Optional<Card> findBySlugAndActiveTrue(String slug);

    long countByActiveTrue();

    @Query("""
        SELECT c FROM Card c
        WHERE :q IS NULL OR :q = '' OR
          LOWER(COALESCE(c.fullName, '')) LIKE LOWER(CONCAT('%', :q, '%')) OR
          LOWER(COALESCE(c.slug, '')) LIKE LOWER(CONCAT('%', :q, '%')) OR
          LOWER(COALESCE(c.company, '')) LIKE LOWER(CONCAT('%', :q, '%')) OR
          LOWER(COALESCE(c.phone, '')) LIKE LOWER(CONCAT('%', :q, '%')) OR
          LOWER(COALESCE(c.email, '')) LIKE LOWER(CONCAT('%', :q, '%')) OR
          LOWER(COALESCE(c.location, '')) LIKE LOWER(CONCAT('%', :q, '%'))
        """)
    Page<Card> search(@Param("q") String q, Pageable pageable);
}
