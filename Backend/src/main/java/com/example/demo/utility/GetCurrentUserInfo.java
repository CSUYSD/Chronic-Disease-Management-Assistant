package com.example.demo.utility;

import com.example.demo.model.userimpl.Patient;
import com.example.demo.repository.PatientDao;
import com.example.demo.utility.jwt.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Component;

import java.util.Arrays;

@Component
public class GetCurrentUserInfo {
    public final JwtUtil jwtUtil;
    public final StringRedisTemplate stringRedisTemplate;
    public final PatientDao patientDao;

    @Autowired
    public GetCurrentUserInfo(JwtUtil jwtUtil, StringRedisTemplate stringRedisTemplate, PatientDao patientDao) {
        this.jwtUtil = jwtUtil;
        this.stringRedisTemplate = stringRedisTemplate;
        this.patientDao = patientDao;
    }

    public Long getCurrentUserId(String token) {
        return jwtUtil.getUserIdFromToken(token.replace("Bearer ", ""));
    }

    public Patient getCurrentPatientEntity(String token){
        Long userId = getCurrentUserId(token);
        return patientDao.findById(userId).get();
    }

    public String getCurrentUserRole(String token) {
        return jwtUtil.getRoleFromToken(token.replace("Bearer ", ""));
    }

    public Long getCurrentAccountId(Long userId) {
        try {
            String pattern = "login_user:" + userId.toString() + ":current_account";
            String accountId = stringRedisTemplate.opsForValue().get(pattern);
            System.out.printf("===============================accountId: %s===============================", accountId);
            return Long.valueOf(accountId);
        } catch (IllegalArgumentException e) {
            System.out.println(e.getMessage());
            System.out.println(Arrays.toString(e.getStackTrace()));
            return null;
        }
    }
}
