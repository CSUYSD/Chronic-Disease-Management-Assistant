package com.example.demo.controller;

import java.util.List;

import com.example.demo.model.DTO.HealthRecordDTO;
import com.example.demo.utility.JWT.JwtUtil;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import com.example.demo.model.HealthRecord;
import com.example.demo.service.RecordService;

@RestController
@RequestMapping("/records")
@Validated
public class RecordController {

    private final RecordService recordService;
    private final JwtUtil jwtUtil;
    @Autowired
    private StringRedisTemplate stringRedisTemplate;

    public RecordController(RecordService recordService, JwtUtil jwtUtil, RedisTemplate<String, Object> redisTemplate) {
        this.recordService = recordService;
        this.jwtUtil = jwtUtil;
    }

    @GetMapping("/all")
    public ResponseEntity<List<HealthRecord>> getAllRecordByAccountId(@RequestHeader("Authorization") String token) {
        Long userId = jwtUtil.getUserIdFromToken(token.replace("Bearer ", ""));
        String pattern = "login_user:" + userId + ":current_account";
        String accountId = stringRedisTemplate.opsForValue().get(pattern);
        List<HealthRecord> healthRecords = recordService.getAllRecordsByAccountId(Long.valueOf(accountId));
        return ResponseEntity.ok(healthRecords);
    }

    @Transactional
    @PostMapping("/create")
    public ResponseEntity<String> addHealthRecord(@RequestHeader("Authorization") String token, @RequestBody HealthRecordDTO healthRecordDTO) {
        if (token == null || token.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("未提供令牌");
        }
        try {
            recordService.addHealthRecord(token, healthRecordDTO);
            return ResponseEntity.status(HttpStatus.CREATED).body("Health record has been created successfully.");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Error creating health record: " + e.getMessage());
        }
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<String> updateHealthRecord(@PathVariable Long id, @RequestBody HealthRecordDTO healthRecordDTO) {
        try {
            recordService.updateHealthRecord(id, healthRecordDTO);
            return ResponseEntity.ok("Health record updated successfully.");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Error updating health record: " + e.getMessage());
        }
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<String> deleteHealthRecord(@PathVariable Long id) {
        try {
            recordService.deleteHealthRecord(id);
            return ResponseEntity.ok("Health record deleted successfully.");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error deleting health record: " + e.getMessage());
        }
    }

    @DeleteMapping("/batch")
    public ResponseEntity<String> deleteRecordsInBatch(@RequestParam Long accountId, @RequestBody List<Long> recordIds) {
        try {
            recordService.deleteHealthRecordsInBatch(accountId, recordIds);
            return ResponseEntity.ok("Records deleted successfully.");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Failed to delete records: " + e.getMessage());
        }
    }

    @GetMapping("/recent")
    public ResponseEntity<List<HealthRecord>> getCertainDaysRecord(@RequestHeader("Authorization") String token, @RequestParam int duration) {
        if (duration < 1 || duration >= 30) {
            return ResponseEntity.badRequest().build();
        }
        try {
            Long userId = jwtUtil.getUserIdFromToken(token.replace("Bearer ", ""));
            String pattern = "login_user:" + userId + ":current_account";
            String accountId = stringRedisTemplate.opsForValue().get(pattern);
            List<HealthRecord> records = recordService.getCertainDaysRecords(Long.valueOf(accountId), duration);
            return ResponseEntity.ok(records);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }
}