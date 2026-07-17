package com.example.businesscard.repository;

import com.example.businesscard.entity.ClientUser;
import com.example.businesscard.entity.PaymentOrder;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PaymentOrderRepository extends JpaRepository<PaymentOrder, Long> {
    Optional<PaymentOrder> findByOrderId(String orderId);

    List<PaymentOrder> findByOwnerOrderByCreatedAtDesc(ClientUser owner);
}
