package com.example.demo.service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import com.example.demo.model.message.AnalyseRequest;
import com.example.demo.service.es.ESHealthRecordService;
import com.example.demo.service.rabbitmq.RabbitMQService;
import com.example.demo.utility.GetCurrentUserInfo;
import com.example.demo.utility.converter.HealthRecordConverter;
import com.example.demo.utility.converter.PromptConverter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.RequestHeader;

import com.example.demo.repository.AccountDao;
import com.example.demo.repository.PatientDao;
import com.example.demo.repository.HealthRecordRepository;
import com.example.demo.model.Account;
import com.example.demo.model.dto.HealthRecordDTO;
import com.example.demo.model.HealthRecord;
import com.example.demo.model.userimpl.Patient;
import com.example.demo.utility.jwt.JwtUtil;

import jakarta.transaction.Transactional;

@Service
public class HealthRecordService {
    private final HealthRecordRepository healthRecordRepository;
    private final PatientDao patientDao;
    private final AccountDao accountDao;
    private final JwtUtil jwtUtil;
    private final RabbitMQService rabbitMQService;
    private final ESHealthRecordService ESHealthRecordService;
    @Autowired
    private StringRedisTemplate stringRedisTemplate;
    @Autowired
    private GetCurrentUserInfo getCurrentUserInfo;

    @Autowired
    public HealthRecordService(HealthRecordRepository healthRecordRepository, JwtUtil jwtUtil, AccountDao accountDao, PatientDao patientDao, RabbitMQService rabbitMQService, ESHealthRecordService ESHealthRecordService) {
        this.healthRecordRepository = healthRecordRepository;
        this.patientDao = patientDao;
        this.jwtUtil = jwtUtil;
        this.accountDao = accountDao;
        this.rabbitMQService = rabbitMQService;
        this.ESHealthRecordService = ESHealthRecordService;
    }

    public List<HealthRecord> getAllRecordsByAccountId(Long accountId) {
        return healthRecordRepository.findAllByAccountId(accountId);
    }

    @Transactional
    public void addHealthRecord(@RequestHeader String token, HealthRecordDTO healthRecordDTO) {
        Long userId = jwtUtil.getUserIdFromToken(token.replace("Bearer ", ""));
        Long accountId = getCurrentUserInfo.getCurrentAccountId(userId);
        System.out.printf("===============================accountId: %s===============================", accountId);

        Account account = accountDao.findById(accountId)
                .orElseThrow(() -> new RuntimeException("Account not found for id: " + accountId));

        Patient patient = patientDao.findById(userId)
                .orElseThrow(() -> new RuntimeException("Patient not found for id: " + userId));

        HealthRecord healthRecord = HealthRecordConverter.toHealthRecord(healthRecordDTO);
        healthRecord.setAccount(account);
        healthRecord.setUserId(userId);
        healthRecordRepository.save(healthRecord);
//        sync health record to elastic search
        ESHealthRecordService.syncHealthRecord(healthRecord);
        // Send the latest health record to AI analyser
        String currentRecord = PromptConverter.parseLatestHealthRecordToPrompt(healthRecordDTO);
        System.out.printf("===============================currentRecord: %s===============================", currentRecord);
        rabbitMQService.sendAnalyseRequestToAIAnalyser(new AnalyseRequest(accountId, currentRecord));
    }

    @Transactional
    public void updateHealthRecord(Long id, HealthRecordDTO healthRecordDTO) {
        HealthRecord existingRecord = healthRecordRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Health record not found for id: " + id));
        HealthRecordConverter.updateHealthRecordFromDTO(existingRecord, healthRecordDTO);
        healthRecordRepository.save(existingRecord);
//       update health record to elastic search
        ESHealthRecordService.syncHealthRecord(existingRecord);
    }

    public void deleteHealthRecord(Long id) {
        HealthRecord record = healthRecordRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Health record not found for id: " + id));
        healthRecordRepository.delete(record);
        ESHealthRecordService.deleteHealthRecord(id);
    }

    @Transactional
    public void deleteHealthRecordsInBatch(Long accountId, List<Long> recordIds) {
        List<HealthRecord> records = healthRecordRepository.findAllByIdInAndAccountId(recordIds, accountId);
        if (records.isEmpty()) {
            throw new RuntimeException("No records found for provided IDs and accountId: " + accountId);
        }
        healthRecordRepository.deleteAll(records);
        ESHealthRecordService.deleteHealthRecords(recordIds);
    }

    public List<HealthRecordDTO> getCertainDaysRecords(Long accountId, Integer duration) {
        List<HealthRecord> records = healthRecordRepository.findCertainDaysRecords(accountId, duration);
        return records.stream()
                .map(HealthRecordConverter::toHealthRecordDTO)
                .collect(Collectors.toList());
    }

}