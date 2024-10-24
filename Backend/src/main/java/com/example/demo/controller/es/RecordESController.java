package com.example.demo.controller.es;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.model.es.HealthRecordDocument;
import com.example.demo.service.es.ESHealthRecordService;

import java.util.List;

@RestController
@RequestMapping("/api/records-search")
public class RecordESController {

    private final ESHealthRecordService ESHealthRecordService;

    public RecordESController(ESHealthRecordService ESHealthRecordService) {
        this.ESHealthRecordService = ESHealthRecordService;
    }

    @GetMapping("/search")
    public List<HealthRecordDocument> searchHealthRecords(
            @RequestHeader("Authorization") String token,
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ESHealthRecordService.searchHealthRecords(token, keyword, page, size);
    }

    @GetMapping("/advanced-search")
    public List<HealthRecordDocument> advancedSearch(
            @RequestHeader("Authorization") String token,
            @RequestParam(required = false) String description,
            @RequestParam(required = false) Integer minSbp,
            @RequestParam(required = false) Integer maxSbp,
            @RequestParam(required = false) Integer minDbp,
            @RequestParam(required = false) Integer maxDbp,
            @RequestParam(required = false) String isHeadache,
            @RequestParam(required = false) String isBackPain,
            @RequestParam(required = false) String isChestPain,
            @RequestParam(required = false) String isLessUrination) {
        return ESHealthRecordService.advancedSearch(token, description, minSbp, maxSbp, minDbp, maxDbp,
                isHeadache, isBackPain, isChestPain, isLessUrination);
    }
}