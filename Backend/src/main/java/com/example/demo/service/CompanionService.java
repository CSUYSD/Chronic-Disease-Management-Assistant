package com.example.demo.service;

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
import org.springframework.stereotype.Service;

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

    /**
     * 构造函数，用于依赖注入。
     * @param patientDao 病人数据访问对象
     * @param getCurrentUserInfo 获取当前用户信息的工具类
     * @param companionDao 陪护人员数据访问对象
     */
    @Autowired
    public CompanionService(PatientDao patientDao, GetCurrentUserInfo getCurrentUserInfo, CompanionDao companionDao) {
        this.getCurrentUserInfo = getCurrentUserInfo;
        this.companionDao = companionDao;
        this.patientDao = patientDao;
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

        // 从Redis获取选定的accountId
        Long accountId = getCurrentUserInfo.getCurrentAccountId(companionId);

        if (accountId != null && patient.getAccounts() != null) {
            patient.getAccounts().stream()
                    .filter(account -> account.getId().equals(accountId))
                    .findFirst()
                    .ifPresent(selectedAccount -> setSelectedAccountInfo(dto, selectedAccount));
        }

        return dto;
    }

    /**
     * 设置选定账户的信息到PatientDTO中。
     * @param dto PatientDTO对象
     * @param selectedAccount 选定的账户
     */
    private void setSelectedAccountInfo(PatientDTO dto, Account selectedAccount) {
        dto.setSelectedAccountName(selectedAccount.getAccountName());
        if (selectedAccount.getHealthRecords() != null) {
            dto.setHealthRecords(selectedAccount.getHealthRecords().stream()
                    .map(HealthRecordConverter::toHealthRecordDTO)
                    .collect(Collectors.toList()));
        }
    }
}