package com.example.demo.controller.security;

import com.example.demo.model.HealthReport;
import com.example.demo.model.WarningRecord;
import com.example.demo.service.WarningService;
import lombok.extern.slf4j.Slf4j;
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
@RequestMapping("/warning")
@Slf4j
public class WarningController {
    private final WarningService warningService;
    @Autowired
    public WarningController(WarningService warningService) {
        this.warningService = warningService;
    }

    @GetMapping
    public ResponseEntity<List<WarningRecord>> getHealthReport(@RequestHeader("Authorization") String token) {
        try {
            List<WarningRecord> warningRecord = warningService.getWarning(token);
            if (warningRecord == null || warningRecord.isEmpty()) {
                return ResponseEntity.noContent().build(); // 无内容
            }
            return ResponseEntity.ok().body(warningRecord); // 正常返回
        } catch (Exception e) {
            log.error("Error in getting health report", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Collections.emptyList()); // 空列表表示错误处理
        }
    }
}

