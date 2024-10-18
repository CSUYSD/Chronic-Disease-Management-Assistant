package com.example.demo.service;

import com.example.demo.Dao.CompanionDao;
import com.example.demo.Dao.PatientDao;
import com.example.demo.Dao.UserDao;
import com.example.demo.model.userimpl.Companion;
import com.example.demo.model.userimpl.Patient;
import com.example.demo.utility.jwt.JwtUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

@Service
public class CompanionService {
    private static final Logger logger = LoggerFactory.getLogger(CompanionService.class);
    private UserDao userDao;
    private final JwtUtil jwtUtil;
    private final RedisTemplate<String, Object> redisTemplate;
    private final CompanionDao companionDao;
    private final PatientDao patientDao;

    @Autowired
    public CompanionService(PatientDao patientDao, UserDao userDao, JwtUtil jwtUtil, RedisTemplate<String, Object> redisTemplate, CompanionDao companionDao) {
        this.userDao = userDao;
        this.jwtUtil = jwtUtil;
        this.redisTemplate = redisTemplate;
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
}
