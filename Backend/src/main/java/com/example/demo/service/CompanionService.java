package com.example.demo.service;

import com.example.demo.model.HealthRecord;
import com.example.demo.model.dto.HealthRecordDTO;
import com.example.demo.repository.AccountDao;
import com.example.demo.repository.CompanionDao;
import com.example.demo.repository.PatientDao;
import com.example.demo.model.Account;
import com.example.demo.model.dto.PatientDTO;
import com.example.demo.model.userimpl.Companion;
import com.example.demo.model.userimpl.Patient;
import com.example.demo.utility.GetCurrentUserInfo;
import com.example.demo.utility.converter.HealthRecordConverter;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.OptionalLong;
import java.util.stream.Collectors;

/**
 * CompanionService 类负责处理与陪护人员（Companion）相关的业务逻辑。
 * 这包括绑定陪护人员到病人、获取陪护人员信息以及获取病人的DTO信息。
 */
@Service
public class CompanionService {
    // 使用 SLF4J 进行日志记录
    private static final Logger logger = LoggerFactory.getLogger(CompanionService.class);

    // 依赖注入所需的组件
    private final GetCurrentUserInfo getCurrentUserInfo;
    private final CompanionDao companionDao;
    private final PatientDao patientDao;
    private final StringRedisTemplate stringRedisTemplate;
    private final HealthRecordService healthRecordService;
    private final AccountDao accountDao;

    /**
     * 构造函数，用于依赖注入。
     * @param patientDao 病人数据访问对象
     * @param getCurrentUserInfo 获取当前用户信息的工具类
     * @param companionDao 陪护人员数据访问对象
     */
    @Autowired
    public CompanionService(PatientDao patientDao, GetCurrentUserInfo getCurrentUserInfo, CompanionDao companionDao, StringRedisTemplate stringRedisTemplate, HealthRecordService healthRecordService, AccountDao accountDao) {
        this.getCurrentUserInfo = getCurrentUserInfo;
        this.companionDao = companionDao;
        this.patientDao = patientDao;
        this.stringRedisTemplate = stringRedisTemplate;
        this.healthRecordService = healthRecordService;
        this.accountDao = accountDao;
    }

    /**
     * 将陪护人员绑定到病人。
     * @param companionId 陪护人员ID
     * @param randomString 病人的随机字符串
     * @return 绑定是否成功
     */
    public boolean bindCompanionToPatient(Long companionId, String randomString) {
        try {
            // 查找陪护人员
            Companion companion = companionDao.findById(companionId).orElse(null);
            if (companion == null) {
                logger.error("未找到 ID 为 {} 的 Companion", companionId);
                return false;
            }

            // 查找病人
            Patient patient = (Patient) patientDao.findByRandomString(randomString).orElse(null);
            if (patient == null) {
                logger.error("未找到随机码为 {} 的 Patient", randomString);
                return false;
            }

            // 绑定陪护人员到病人
            companion.setPatient(patient);
            companionDao.save(companion);
            return true;
        } catch (Exception e) {
            logger.error("绑定失败: ", e);
            return false;
        }
    }

    /**
     * 根据ID获取陪护人员。
     * @param companionId 陪护人员ID
     * @return 陪护人员对象，如果不存在则返回null
     */
    public Companion getCompanionById(Long companionId) {
        return companionDao.findById(companionId).orElse(null);
    }

    /**
     * 获取陪护人员关联的病人的DTO信息。
     * @param token 用户token
     * @return 病人的DTO信息
     */
    public PatientDTO getPatientDTOForCompanion(String token) {
        Long companionId = getCurrentUserInfo.getCurrentUserId(token);
        Companion companion = getCompanionById(companionId);
        if (companion == null || companion.getPatient() == null) {
            return null;
        }

        Patient patient = companion.getPatient();
        PatientDTO dto = new PatientDTO();
        // 设置病人的基本信息
        dto.setId(patient.getId());
        dto.setUsername(patient.getUsername());
        dto.setEmail(patient.getEmail());
        dto.setPhone(patient.getPhone());
        dto.setDob(patient.getDob());
        dto.setAvatar(patient.getAvatar());
        List<Account> accounts = patient.getAccounts();
        dto.setAccounts(accounts);
        return dto;
    }

    public List<HealthRecordDTO> getAllRecordsForCompanion(String token, String accountName) {
        Long companionId = getCurrentUserInfo.getCurrentUserId(token);
        Patient patient = getPatientByCompanionId(companionId);
        Long userId = patient.getId();
        Optional<Long> accountId = accountDao.findAccountIdByAccountNameAndPatientId(accountName, userId);
        List<HealthRecord> healthRecords = healthRecordService.getAllRecordsByAccountId(accountId);
        return healthRecords.stream().map(HealthRecordConverter::toHealthRecordDTO).collect(Collectors.toList());
    }

    public Patient getPatientByCompanionId(Long companionId) {
        return companionDao.findById(companionId).map(Companion::getPatient).orElse(null);
    }
}