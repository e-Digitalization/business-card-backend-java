package com.example.businesscard.repository;

import com.example.businesscard.entity.AccountInvite;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface AccountInviteRepository extends JpaRepository<AccountInvite, Long> {
    Optional<AccountInvite> findFirstByEmailIgnoreCaseAndUsedAtIsNullOrderByCreatedAtDesc(String email);

    Optional<AccountInvite> findFirstByCard_IdAndUsedAtIsNullOrderByCreatedAtDesc(Long cardId);
}
