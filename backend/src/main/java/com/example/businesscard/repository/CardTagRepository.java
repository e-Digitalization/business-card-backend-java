package com.example.businesscard.repository;

import com.example.businesscard.entity.CardTag;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CardTagRepository extends JpaRepository<CardTag, Long> {
    Optional<CardTag> findByTagCode(String tagCode);

    Optional<CardTag> findByTagCodeAndActiveTrue(String tagCode);

    List<CardTag> findByCard_Id(Long cardId);

    List<CardTag> findByCard_IdIn(List<Long> cardIds);

    long countByActiveTrue();

    void deleteByCard_Id(Long cardId);
}
