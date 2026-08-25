package com.example.businesscard.repository;

import com.example.businesscard.entity.AdminUser;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface AdminUserRepository extends JpaRepository<AdminUser, Long> {
    Optional<AdminUser> findByUsername(String username);

    boolean existsByUsername(String username);

    long countByActiveTrue();

    List<AdminUser> findAllByOrderByIdAsc();
}
