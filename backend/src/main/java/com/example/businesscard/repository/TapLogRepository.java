package com.example.businesscard.repository;

import com.example.businesscard.entity.TapLog;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TapLogRepository extends JpaRepository<TapLog, Long> {
}
