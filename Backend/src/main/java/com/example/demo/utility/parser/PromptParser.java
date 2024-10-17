package com.example.demo.utility.parser;

import com.example.demo.model.dto.HealthRecordDTO;

import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

public class PromptParser {
    private static final int MAX_RECORDS = 10;
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss z");

    public static String parseLatestTransactionRecordsToPrompt(List<HealthRecordDTO> records) {
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
                    sb.append("Record: ").append(parseHealthRecordToString(record)).append("\n");
                });

        return sb.toString();
    }

    private static String parseHealthRecordToString(HealthRecordDTO record) {
        return String.format("{SBP: %d} {DBP: %d} {Headache: %s} {Back Pain: %s} " +
                        "{Chest Pain: %s} {Less Urination: %s} {Date: %s} {Description: %s}",
                record.getSbp(),
                record.getDbp(),
                record.getIsHeadache(),
                record.getIsBackPain(),
                record.getIsChestPain(),
                record.getIsLessUrination(),
                record.getImportTime().format(DateTimeFormatter.ISO_OFFSET_DATE_TIME),
                record.getDescription());
    }
}
