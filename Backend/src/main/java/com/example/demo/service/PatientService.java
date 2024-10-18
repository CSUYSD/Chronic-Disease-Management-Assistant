package com.example.demo.service;

import com.example.demo.Dao.PatientDao;
import com.example.demo.model.userimpl.Patient;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class PatientService {

    private final PatientDao patientDao;

    @Autowired
    public PatientService(PatientDao patientDao) {
        this.patientDao = patientDao;
    }

    public String getRandomStringById(Long patientId) {
        Patient patient = patientDao.findById(patientId)
                .orElseThrow(() -> new RuntimeException("Patient not found"));
        return patient.getRandomString();
    }
}