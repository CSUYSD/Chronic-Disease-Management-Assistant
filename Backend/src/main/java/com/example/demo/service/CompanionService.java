package com.example.demo.service;

import com.example.demo.Dao.CompanionDao;
import com.example.demo.Dao.PatientDao;
import com.example.demo.Dao.UserDao;
import com.example.demo.model.UserImpl.Companion;
import com.example.demo.model.UserImpl.Patient;
import com.example.demo.utility.JWT.JwtUtil;
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
            // 查找 Companion 和 Patient
            Companion companion = companionDao.findById(companionId).orElse(null);
            Patient patient = (Patient) patientDao.findByRandomString(randomString).orElse(null);

            if (companion != null && patient != null) {
                companion.setPatient(patient);
                companionDao.save(companion);
                return true;
            }
        } catch (Exception e) {
            logger.error("绑定失败: ", e);
        }
        return false;
    }
}
