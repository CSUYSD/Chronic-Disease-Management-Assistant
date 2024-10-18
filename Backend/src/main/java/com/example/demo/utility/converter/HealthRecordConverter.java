package com.example.demo.utility.converter;

import com.example.demo.model.dto.HealthRecordDTO;
import com.example.demo.model.HealthRecord;

public class HealthRecordConverter {
    public static HealthRecord toHealthRecord(HealthRecordDTO healthRecordDTO) {
        HealthRecord healthRecord = new HealthRecord();
        healthRecord.setSbp(healthRecordDTO.getSbp());
        healthRecord.setDbp(healthRecordDTO.getDbp());
        healthRecord.setIsHeadache(healthRecordDTO.getIsHeadache());
        healthRecord.setIsBackPain(healthRecordDTO.getIsBackPain());
        healthRecord.setIsChestPain(healthRecordDTO.getIsChestPain());
        healthRecord.setIsLessUrination(healthRecordDTO.getIsLessUrination());
        healthRecord.setImportTime(healthRecordDTO.getImportTime());
        healthRecord.setDescription(healthRecordDTO.getDescription());
        return healthRecord;
    }

    public static HealthRecordDTO toHealthRecordDTO(HealthRecord healthRecord) {
        HealthRecordDTO dto = new HealthRecordDTO();
        dto.setSbp(healthRecord.getSbp());
        dto.setDbp(healthRecord.getDbp());
        dto.setIsHeadache(healthRecord.getIsHeadache());
        dto.setIsBackPain(healthRecord.getIsBackPain());
        dto.setIsChestPain(healthRecord.getIsChestPain());
        dto.setIsLessUrination(healthRecord.getIsLessUrination());
        dto.setImportTime(healthRecord.getImportTime());
        dto.setDescription(healthRecord.getDescription());
        return dto;
    }

    public static void updateHealthRecordFromDTO(HealthRecord healthRecord, HealthRecordDTO dto) {
        healthRecord.setSbp(dto.getSbp());
        healthRecord.setDbp(dto.getDbp());
        healthRecord.setIsHeadache(dto.getIsHeadache());
        healthRecord.setIsBackPain(dto.getIsBackPain());
        healthRecord.setIsChestPain(dto.getIsChestPain());
        healthRecord.setIsLessUrination(dto.getIsLessUrination());
        healthRecord.setImportTime(dto.getImportTime());
        healthRecord.setDescription(dto.getDescription());
    }
}
