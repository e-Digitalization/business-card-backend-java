package com.example.businesscard.repository;

import com.example.businesscard.entity.EmailVerification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

public interface EmailVerificationRepository extends JpaRepository<EmailVerification, Long> {
    Optional<EmailVerification> findFirstByEmailIgnoreCaseAndConsumedAtIsNullOrderByCreatedAtDesc(String email);

    @Modifying
    @Transactional
    @Query("delete from EmailVerification v where lower(v.email) = lower(?1) and v.consumedAt is null")
    void deletePendingForEmail(String email);
}
