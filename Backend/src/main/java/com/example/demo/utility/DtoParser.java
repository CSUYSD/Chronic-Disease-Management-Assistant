package com.example.demo.utility;

import com.example.demo.model.DTO.HealthRecordDTO;
import com.example.demo.model.HealthRecord;

public class DtoParser {
    public static HealthRecord toHealthRecord(HealthRecordDTO healthRecordDTO) {
        HealthRecord healthRecord = new HealthRecord();
        healthRecord.setSBP(healthRecordDTO.getSBP());
        healthRecord.setDBP(healthRecordDTO.getDBP());
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
        dto.setSBP(healthRecord.getSBP());
        dto.setDBP(healthRecord.getDBP());
        dto.setIsHeadache(healthRecord.getIsHeadache());
        dto.setIsBackPain(healthRecord.getIsBackPain());
        dto.setIsChestPain(healthRecord.getIsChestPain());
        dto.setIsLessUrination(healthRecord.getIsLessUrination());
        dto.setImportTime(healthRecord.getImportTime());
        dto.setDescription(healthRecord.getDescription());
        return dto;
    }
}
