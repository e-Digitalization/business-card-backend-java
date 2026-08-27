package com.example.businesscard.repository;

import com.example.businesscard.entity.TapLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface TapLogRepository extends JpaRepository<TapLog, Long> {
    @Query("""
        SELECT COUNT(t) FROM TapLog t
        WHERE t.tagCode IN (SELECT ct.tagCode FROM CardTag ct WHERE ct.card.id = :cardId)
        """)
    long countByCardId(@Param("cardId") Long cardId);
}
