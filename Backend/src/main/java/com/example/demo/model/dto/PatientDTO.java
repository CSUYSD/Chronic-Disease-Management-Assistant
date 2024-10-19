package com.example.demo.model.dto;

import lombok.Data;

import java.time.LocalDate;
import java.util.List;

@Data
public class PatientDTO {
    private Long id;
    private String username;
    private String email;
    private String phone;
    private LocalDate dob;
    private String avatar;
    private String selectedAccountName;
    private List<HealthRecordDTO> healthRecords;
}