package com.example.demo.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.RequestHeader;

import com.example.demo.Dao.AccountDao;
import com.example.demo.Dao.PatientDao;
import com.example.demo.Dao.RecordDao;
import com.example.demo.model.Account;
import com.example.demo.model.DTO.HealthRecordDTO;
import com.example.demo.model.HealthRecord;
import com.example.demo.model.UserImpl.Patient;
import com.example.demo.utility.JWT.JwtUtil;

import jakarta.transaction.Transactional;

@Service
public class RecordService {
    private final RecordDao recordDao;
    private final PatientDao patientDao;
    private final AccountDao accountDao;
    private final JwtUtil jwtUtil;
    private final RedisTemplate redisTemplate;
    @Autowired
    private StringRedisTemplate stringRedisTemplate;

    @Autowired
    public RecordService(RecordDao recordDao, JwtUtil jwtUtil, @Qualifier("redisTemplate") RedisTemplate redisTemplate, AccountDao accountDao, PatientDao patientDao) {
        this.recordDao = recordDao;
        this.patientDao = patientDao;
        this.jwtUtil = jwtUtil;
        this.redisTemplate = redisTemplate;
        this.accountDao = accountDao;
    }

    public List<HealthRecord> getAllRecordsByAccountId(Long accountId) {
        return recordDao.findAllByAccountId(accountId);
    }

    @Transactional
    public void addHealthRecord(@RequestHeader String token, HealthRecordDTO healthRecordDTO) {
        Long userId = jwtUtil.getUserIdFromToken(token.replace("Bearer ", ""));
        String pattern = "login_user:" + userId + ":current_account";
        String accountId = stringRedisTemplate.opsForValue().get(pattern);
        System.out.printf("===============================accountId: %s===============================", accountId);

        Account account = accountDao.findById(Long.valueOf(accountId))
                .orElseThrow(() -> new RuntimeException("Account not found for id: " + accountId));

        Patient patient = patientDao.findById(userId)
                .orElseThrow(() -> new RuntimeException("Patient not found for id: " + userId));

        HealthRecord healthRecord = new HealthRecord();
        healthRecord.setSBP(healthRecordDTO.getSBP());
        healthRecord.setDBP(healthRecordDTO.getDBP());
        healthRecord.setIsHeadache(healthRecordDTO.getIsHeadache());
        healthRecord.setIsBackPain(healthRecordDTO.getIsBackPain());
        healthRecord.setIsChestPain(healthRecordDTO.getIsChestPain());
        healthRecord.setIsLessUrination(healthRecordDTO.getIsLessUrination());
        healthRecord.setImportTime(healthRecordDTO.getImportTime());
        healthRecord.setDescription(healthRecordDTO.getDescription());
        healthRecord.setAccount(account);
        healthRecord.setUserId(userId);

        recordDao.save(healthRecord);
    }

    @Transactional
    public void updateHealthRecord(Long id, HealthRecordDTO healthRecordDTO) {
        HealthRecord existingRecord = recordDao.findById(id)
                .orElseThrow(() -> new RuntimeException("Health record not found for id: " + id));

        existingRecord.setSBP(healthRecordDTO.getSBP());
        existingRecord.setDBP(healthRecordDTO.getDBP());
        existingRecord.setIsHeadache(healthRecordDTO.getIsHeadache());
        existingRecord.setIsBackPain(healthRecordDTO.getIsBackPain());
        existingRecord.setIsChestPain(healthRecordDTO.getIsChestPain());
        existingRecord.setIsLessUrination(healthRecordDTO.getIsLessUrination());
        existingRecord.setImportTime(healthRecordDTO.getImportTime());
        existingRecord.setDescription(healthRecordDTO.getDescription());

        recordDao.save(existingRecord);
    }

    public void deleteHealthRecord(Long id) {
        HealthRecord record = recordDao.findById(id)
                .orElseThrow(() -> new RuntimeException("Health record not found for id: " + id));
        recordDao.delete(record);
    }

    @Transactional
    public void deleteHealthRecordsInBatch(Long accountId, List<Long> recordIds) {
        List<HealthRecord> records = recordDao.findAllByIdInAndAccountId(recordIds, accountId);
        if (records.isEmpty()) {
            throw new RuntimeException("No records found for provided IDs and accountId: " + accountId);
        }
        recordDao.deleteAll(records);
    }

    public List<HealthRecord> getCertainDaysRecords(Long accountId, Integer duration) {
        return recordDao.findCertainDaysRecords(accountId, duration);
    }
}