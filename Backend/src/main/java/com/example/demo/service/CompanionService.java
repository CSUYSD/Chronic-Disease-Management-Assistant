package com.example.demo.service;

import com.example.demo.Dao.CompanionDao;
import com.example.demo.Dao.PatientDao;
import com.example.demo.Dao.UserDao;
import com.example.demo.model.Account;
import com.example.demo.model.dto.PatientDTO;
import com.example.demo.model.userimpl.Companion;
import com.example.demo.model.userimpl.Patient;
import com.example.demo.utility.converter.HealthRecordConverter;
import com.example.demo.utility.jwt.JwtUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.util.stream.Collectors;

@Service
public class CompanionService {
    private static final Logger logger = LoggerFactory.getLogger(CompanionService.class);
    private final JwtUtil jwtUtil;
    private final CompanionDao companionDao;
    private final PatientDao patientDao;
    @Autowired
    private StringRedisTemplate stringRedisTemplate;

    @Autowired
    public CompanionService(PatientDao patientDao, JwtUtil jwtUtil, CompanionDao companionDao) {
        this.jwtUtil = jwtUtil;
        this.companionDao = companionDao;
        this.patientDao = patientDao;
    }

    public boolean bindCompanionToPatient(Long companionId, String randomString) {
        try {
            // 查找 Companion
            Companion companion = companionDao.findById(companionId).orElse(null);
            if (companion == null) {
                logger.error("未找到 ID 为 {} 的 Companion", companionId);
                return false;
            }

            // 查找 Patient
            Patient patient = (Patient) patientDao.findByRandomString(randomString).orElse(null);
            if (patient == null) {
                logger.error("未找到随机码为 {} 的 Patient", randomString);
                return false;
            }

            // 绑定 Companion 到 Patient
            companion.setPatient(patient);
            companionDao.save(companion);
            return true;
        } catch (Exception e) {
            logger.error("绑定失败: ", e);
            return false;
        }
    }

    public Companion getCompanionById(Long companionId) {
        return companionDao.findById(companionId).orElse(null);
    }

    public PatientDTO getPatientDTOForCompanion(String token) {
        Long companionId = jwtUtil.getUserIdFromToken(token.replace("Bearer ", ""));
        Companion companion = getCompanionById(companionId);
        if (companion == null || companion.getPatient() == null) {
            return null;
        }

        Patient patient = companion.getPatient();
        PatientDTO dto = new PatientDTO();
        dto.setId(patient.getId());
        dto.setUsername(patient.getUsername());
        dto.setEmail(patient.getEmail());
        dto.setPhone(patient.getPhone());
        dto.setDob(patient.getDob());
        dto.setAvatar(patient.getAvatar());

        // 从 Redis 获取选定的 accountId
        String pattern = "login_user:" + patient.getId() + ":current_account";
        String accountId = stringRedisTemplate.opsForValue().get(pattern);

        if (accountId != null && patient.getAccounts() != null) {
            Account selectedAccount = patient.getAccounts().stream()
                    .filter(account -> account.getId().toString().equals(accountId))
                    .findFirst()
                    .orElse(null);

            if (selectedAccount != null) {
                dto.setSelectedAccountName(selectedAccount.getAccountName());

                if (selectedAccount.getHealthRecords() != null) {
                    dto.setHealthRecords(selectedAccount.getHealthRecords().stream()
                            .map(HealthRecordConverter::toHealthRecordDTO)
                            .collect(Collectors.toList()));
                }
            }
        }

        return dto;
    }
}
