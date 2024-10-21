package com.example.demo.controller.es;

import org.springframework.data.domain.Page;
import org.springframework.data.elasticsearch.core.SearchHits;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.model.HealthRecordDocument;
import com.example.demo.service.es.HealthRecordService;

import java.util.List;

@RestController
@RequestMapping("/api/records-search")
public class RecordESController {

    private final HealthRecordService healthRecordService;

    public RecordESController(HealthRecordService healthRecordService) {
        this.healthRecordService = healthRecordService;
    }

    @GetMapping("/search")
    public List<HealthRecordDocument> searchHealthRecords(
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return healthRecordService.searchHealthRecords(keyword, page, size);
    }

    @GetMapping("/advanced-search")
    public List<HealthRecordDocument> advancedSearch(
            @RequestParam(required = false) String description,
            @RequestParam(required = false) Integer minSbp,
            @RequestParam(required = false) Integer maxSbp,
            @RequestParam(required = false) Integer minDbp,
            @RequestParam(required = false) Integer maxDbp,
            @RequestParam(required = false) String isHeadache,
            @RequestParam(required = false) String isBackPain,
            @RequestParam(required = false) String isChestPain,
            @RequestParam(required = false) String isLessUrination) {
        return healthRecordService.advancedSearch(description, minSbp, maxSbp, minDbp, maxDbp,
                isHeadache, isBackPain, isChestPain, isLessUrination);
    }
}