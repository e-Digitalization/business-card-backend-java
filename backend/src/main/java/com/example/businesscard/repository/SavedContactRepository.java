package com.example.businesscard.repository;

import com.example.businesscard.entity.ClientUser;
import com.example.businesscard.entity.SavedContact;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface SavedContactRepository extends JpaRepository<SavedContact, Long> {
    Page<SavedContact> findByOwnerOrderByCreatedAtDesc(ClientUser owner, Pageable pageable);

    Optional<SavedContact> findByIdAndOwner(Long id, ClientUser owner);

    Optional<SavedContact> findByOwnerAndSourceProfileSlug(ClientUser owner, String sourceProfileSlug);

    @Query("""
        SELECT c FROM SavedContact c
        WHERE c.owner = :owner AND (
          LOWER(COALESCE(c.fullName, '')) LIKE LOWER(CONCAT('%', :q, '%')) OR
          LOWER(COALESCE(c.company, '')) LIKE LOWER(CONCAT('%', :q, '%')) OR
          LOWER(COALESCE(c.email, '')) LIKE LOWER(CONCAT('%', :q, '%')) OR
          LOWER(COALESCE(c.phone, '')) LIKE LOWER(CONCAT('%', :q, '%')) OR
          LOWER(COALESCE(c.title, '')) LIKE LOWER(CONCAT('%', :q, '%'))
        )
        """)
    Page<SavedContact> search(@Param("owner") ClientUser owner, @Param("q") String q, Pageable pageable);
}
