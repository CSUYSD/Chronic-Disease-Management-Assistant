package com.example.demo.repository;

import com.example.demo.model.HealthRecordDocument;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.elasticsearch.repository.ElasticsearchRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface HealthRecordESRepository extends ElasticsearchRepository<HealthRecordDocument, String> {
    Page<HealthRecordDocument> findByAccountIdAndDescriptionContaining(Long accountId, String keyword, Pageable pageable);
}