package com.example.demo.model.dto;

import com.example.demo.model.Account;
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
    private List<AccountDTO> accounts;
}
