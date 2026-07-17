package com.example.businesscard.repository;

import com.example.businesscard.entity.ClientUser;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ClientUserRepository extends JpaRepository<ClientUser, Long> {
    Optional<ClientUser> findByGoogleSub(String googleSub);

    Optional<ClientUser> findByEmailIgnoreCase(String email);
}
