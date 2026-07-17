package com.example.businesscard.repository;

import com.example.businesscard.entity.ClientUser;
import com.example.businesscard.entity.NfcCardRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface NfcCardRequestRepository extends JpaRepository<NfcCardRequest, Long> {
    List<NfcCardRequest> findByOwnerOrderByCreatedAtDesc(ClientUser owner);

    Optional<NfcCardRequest> findByPaymentOrderId(String paymentOrderId);

    Page<NfcCardRequest> findAllByOrderByCreatedAtDesc(Pageable pageable);

    @Query("""
        SELECT r FROM NfcCardRequest r
        WHERE (:status IS NULL OR r.status = :status)
          AND (
            :q IS NULL OR :q = '' OR
            LOWER(COALESCE(r.productName, '')) LIKE LOWER(CONCAT('%', :q, '%')) OR
            LOWER(COALESCE(r.paymentOrderId, '')) LIKE LOWER(CONCAT('%', :q, '%')) OR
            LOWER(COALESCE(r.phone, '')) LIKE LOWER(CONCAT('%', :q, '%')) OR
            LOWER(COALESCE(r.owner.fullName, '')) LIKE LOWER(CONCAT('%', :q, '%')) OR
            LOWER(COALESCE(r.owner.email, '')) LIKE LOWER(CONCAT('%', :q, '%'))
          )
        """)
    Page<NfcCardRequest> search(
        @Param("q") String q,
        @Param("status") String status,
        Pageable pageable
    );
}
