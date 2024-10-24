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
import com.example.demo.repository.RecordDao;
import com.example.demo.model.Account;
import com.example.demo.model.dto.HealthRecordDTO;
import com.example.demo.model.HealthRecord;
import com.example.demo.model.userimpl.Patient;
import com.example.demo.utility.jwt.JwtUtil;

import jakarta.transaction.Transactional;

@Service
public class HealthRecordService {
    private final RecordDao recordDao;
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
    public HealthRecordService(RecordDao recordDao, JwtUtil jwtUtil, AccountDao accountDao, PatientDao patientDao, RabbitMQService rabbitMQService, ESHealthRecordService ESHealthRecordService) {
        this.recordDao = recordDao;
        this.patientDao = patientDao;
        this.jwtUtil = jwtUtil;
        this.accountDao = accountDao;
        this.rabbitMQService = rabbitMQService;
        this.ESHealthRecordService = ESHealthRecordService;
    }

    public List<HealthRecord> getAllRecordsByAccountId(Optional<Long> accountId) {
        return recordDao.findAllByAccountId(accountId);
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
        recordDao.save(healthRecord);
//        sync health record to elastic search
        ESHealthRecordService.syncHealthRecord(healthRecord);
        // Send the latest health record to AI analyser
        String currentRecord = PromptConverter.parseLatestHealthRecordToPrompt(healthRecordDTO);
        System.out.printf("===============================currentRecord: %s===============================", currentRecord);
        rabbitMQService.sendAnalyseRequestToAIAnalyser(new AnalyseRequest(accountId, currentRecord));
    }

    @Transactional
    public void updateHealthRecord(Long id, HealthRecordDTO healthRecordDTO) {
        HealthRecord existingRecord = recordDao.findById(id)
                .orElseThrow(() -> new RuntimeException("Health record not found for id: " + id));
        HealthRecordConverter.updateHealthRecordFromDTO(existingRecord, healthRecordDTO);
        recordDao.save(existingRecord);
//       update health record to elastic search
        ESHealthRecordService.syncHealthRecord(existingRecord);
    }

    public void deleteHealthRecord(Long id) {
        HealthRecord record = recordDao.findById(id)
                .orElseThrow(() -> new RuntimeException("Health record not found for id: " + id));
        recordDao.delete(record);
//      delete health record from elastic search
        ESHealthRecordService.deleteHealthRecord(id);
    }

    @Transactional
    public void deleteHealthRecordsInBatch(Long accountId, List<Long> recordIds) {
        List<HealthRecord> records = recordDao.findAllByIdInAndAccountId(recordIds, accountId);
        if (records.isEmpty()) {
            throw new RuntimeException("No records found for provided IDs and accountId: " + accountId);
        }
        recordDao.deleteAll(records);
//      delete health records in batch from elastic search
        ESHealthRecordService.deleteHealthRecords(recordIds);
    }

    public List<HealthRecordDTO> getCertainDaysRecords(Long accountId, Integer duration) {
        List<HealthRecord> records = recordDao.findCertainDaysRecords(accountId, duration);
        return records.stream()
                .map(HealthRecordConverter::toHealthRecordDTO)
                .collect(Collectors.toList());
    }

}