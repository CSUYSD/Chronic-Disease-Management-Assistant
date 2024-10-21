package com.example.demo.service.es;

import com.example.demo.model.HealthRecord;
import com.example.demo.model.HealthRecordDocument;
import com.example.demo.repository.HealthRecordESRepository;
import com.example.demo.utility.GetCurrentUserInfo;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.elasticsearch.core.ElasticsearchOperations;
import org.springframework.data.elasticsearch.core.SearchHit;
import org.springframework.data.elasticsearch.core.SearchHits;
import org.springframework.data.elasticsearch.core.query.Criteria;
import org.springframework.data.elasticsearch.core.query.CriteriaQuery;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class HealthRecordService {

    private final HealthRecordESRepository healthRecordESRepository;
    private final ElasticsearchOperations elasticsearchOperations;
    private final GetCurrentUserInfo getCurrentUserInfo;

    public HealthRecordService(HealthRecordESRepository healthRecordESRepository, ElasticsearchOperations elasticsearchOperations, GetCurrentUserInfo getCurrentUserInfo) {
        this.healthRecordESRepository = healthRecordESRepository;
        this.elasticsearchOperations = elasticsearchOperations;
        this.getCurrentUserInfo = getCurrentUserInfo;
    }

    public void syncHealthRecord(HealthRecord healthRecord) {
        HealthRecordDocument document = convertToDocument(healthRecord);
        healthRecordESRepository.save(document);
    }

    public void deleteHealthRecord(Long id) {
        String recordId = id.toString();
        healthRecordESRepository.deleteById(recordId);
    }

    public void deleteHealthRecords(List<Long> ids) {
        List<String> recordIds = ids.stream().map(Object::toString).collect(Collectors.toList());
        healthRecordESRepository.deleteAllById(recordIds);
    }

    public List<HealthRecordDocument> searchHealthRecords(String token, String keyword, int page, int size) {
        Long userId = getCurrentUserInfo.getCurrentUserId(token);
        Long accountId = getCurrentUserInfo.getCurrentAccountId(userId);
        PageRequest pageRequest = PageRequest.of(page, size);
        return healthRecordESRepository.findByAccountIdAndDescriptionContaining(accountId, keyword, pageRequest).getContent();
    }

    public List<HealthRecordDocument> advancedSearch(String token, String description, Integer minSbp, Integer maxSbp,
                                                     Integer minDbp, Integer maxDbp, String isHeadache,
                                                     String isBackPain, String isChestPain, String isLessUrination) {

        Long userId = getCurrentUserInfo.getCurrentUserId(token);
        Long accountId = getCurrentUserInfo.getCurrentAccountId(userId);

        Criteria criteria = new Criteria("accountId").is(accountId);

        if (description != null && !description.isEmpty()) {
            criteria = criteria.and("description").contains(description);
        }
        if (minSbp != null) {
            criteria = criteria.and("sbp").greaterThanEqual(minSbp);
        }
        if (maxSbp != null) {
            criteria = criteria.and("sbp").lessThanEqual(maxSbp);
        }
        if (minDbp != null) {
            criteria = criteria.and("dbp").greaterThanEqual(minDbp);
        }
        if (maxDbp != null) {
            criteria = criteria.and("dbp").lessThanEqual(maxDbp);
        }
        if (isHeadache != null) {
            criteria = criteria.and("isHeadache").is(isHeadache);
        }
        if (isBackPain != null) {
            criteria = criteria.and("isBackPain").is(isBackPain);
        }
        if (isChestPain != null) {
            criteria = criteria.and("isChestPain").is(isChestPain);
        }
        if (isLessUrination != null) {
            criteria = criteria.and("isLessUrination").is(isLessUrination);
        }

        CriteriaQuery query = new CriteriaQuery(criteria);
        SearchHits<HealthRecordDocument> searchHits = elasticsearchOperations.search(query, HealthRecordDocument.class);
        return searchHits.getSearchHits().stream()
                .map(SearchHit::getContent)
                .collect(Collectors.toList());
    }

    private HealthRecordDocument convertToDocument(HealthRecord healthRecord) {
        HealthRecordDocument document = new HealthRecordDocument();
        document.setId(String.valueOf(healthRecord.getId()));
        document.setSbp(healthRecord.getSbp());
        document.setDbp(healthRecord.getDbp());
        document.setIsHeadache(healthRecord.getIsHeadache());
        document.setIsBackPain(healthRecord.getIsBackPain());
        document.setIsChestPain(healthRecord.getIsChestPain());
        document.setIsLessUrination(healthRecord.getIsLessUrination());
        document.setImportTime(healthRecord.getImportTime());
        document.setDescription(healthRecord.getDescription());
        document.setUserId(healthRecord.getUserId());
        document.setAccountId(healthRecord.getAccount().getId());
        return document;
    }
}