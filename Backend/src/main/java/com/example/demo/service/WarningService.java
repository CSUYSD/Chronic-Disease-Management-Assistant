package com.example.demo.service;

import com.example.demo.model.HealthReport;
import com.example.demo.model.WarningRecord;
import com.example.demo.model.userimpl.Companion;
import com.example.demo.model.userimpl.Patient;
import com.example.demo.repository.CompanionDao;
import com.example.demo.repository.PatientDao;
import com.example.demo.repository.WarningRecordRepository;
import com.example.demo.utility.GetCurrentUserInfo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class WarningService {
    private final GetCurrentUserInfo getCurrentUserInfo;
    private final CompanionDao companionDao;
    private final PatientDao patientDao;
    private final WarningRecordRepository warningRecordRepository;

    @Autowired
    public WarningService(GetCurrentUserInfo getCurrentUserInfo, CompanionDao companionDao, PatientDao patientDao, WarningRecordRepository warningRecordRepository) {
        this.getCurrentUserInfo = getCurrentUserInfo;
        this.companionDao = companionDao;
        this.patientDao = patientDao;
        this.warningRecordRepository = warningRecordRepository;
    }

    public List<WarningRecord> getWarning(String token) {
        if (getCurrentUserInfo.getCurrentUserRole(token).equals("ROLE_PATIENT")){
            Patient patient = patientDao.findById(getCurrentUserInfo.getCurrentUserId(token)).get();
            return patient.getWarningRecord();
        } else if (getCurrentUserInfo.getCurrentUserRole(token).equals("ROLE_COMPANION")){
            Optional<Companion> companion = companionDao.findById(getCurrentUserInfo.getCurrentUserId(token));
            if (companion.isPresent()){
                Patient patient = companion.get().getPatient();
                return patient.getWarningRecord();
            }
        }
        return List.of();
    }
}
