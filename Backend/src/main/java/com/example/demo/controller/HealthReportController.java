package com.example.demo.controller;

import com.example.demo.model.HealthReport;
import com.example.demo.service.HealthReportService;
import lombok.extern.slf4j.Slf4j;
import org.apache.coyote.Response;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Collections;
import java.util.List;

@RestController
@RequestMapping("/health-report")
@Slf4j
public class HealthReportController {
    private final HealthReportService healthReportService;
    @Autowired
    public HealthReportController(HealthReportService healthReportService) {
        this.healthReportService = healthReportService;
    }

    @GetMapping
    public ResponseEntity<List<HealthReport>> getHealthReport(@RequestHeader("Authorization") String token) {
        try {
            List<HealthReport> healthReports = healthReportService.getHealthReports(token);
            if (healthReports == null || healthReports.isEmpty()) {
                return ResponseEntity.noContent().build(); // 无内容
            }
            return ResponseEntity.ok().body(healthReports); // 正常返回
        } catch (Exception e) {
            log.error("Error in getting health report", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Collections.emptyList()); // 空列表表示错误处理
        }
    }
}
