package com.example.demo.utility.converter;

import com.example.demo.model.dto.HealthRecordDTO;

import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

public class PromptConverter {
    private static final int MAX_RECORDS = 10;
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss z");

    public static String parseRecentHealthRecordsToPrompt(List<HealthRecordDTO> records) {
        List<HealthRecordDTO> processedRecords = new ArrayList<>(records);
        if (!processedRecords.isEmpty()) {
            processedRecords.remove(0);
        }
        System.out.printf("====================================Fetched Recent Records: %s\n", processedRecords);
        if (processedRecords.isEmpty()) {
            return "No records found.";
        }
        StringBuilder sb = new StringBuilder();
        processedRecords.stream()
                .limit(MAX_RECORDS)
                .forEach(record -> {
                    sb.append("Record: ").append(parseHealthRecordDTOToString(record)).append("\n");
                });

        return sb.toString();
    }

    public static String parseLatestHealthRecordToPrompt(HealthRecordDTO record) {
        if (record == null) {
            return "No records found.";
        }
        return "latest record: " + parseHealthRecordDTOToString(record);
    }

    private static String parseHealthRecordDTOToString(HealthRecordDTO healthRecordDTO) {
        return String.format("SBP:%d; DBP:%d; Headache:%s; Back Pain:%s; " +
                        "Chest Pain:%s; Less Urination:%s; Date:%s; Description:%s",
                healthRecordDTO.getSbp(),
                healthRecordDTO.getDbp(),
                healthRecordDTO.getIsHeadache(),
                healthRecordDTO.getIsBackPain(),
                healthRecordDTO.getIsChestPain(),
                healthRecordDTO.getIsLessUrination(),
                healthRecordDTO.getImportTime().format(DateTimeFormatter.ISO_OFFSET_DATE_TIME),
                healthRecordDTO.getDescription());
    }
}