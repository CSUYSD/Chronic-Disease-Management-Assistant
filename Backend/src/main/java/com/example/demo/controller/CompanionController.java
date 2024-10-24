package com.example.demo.controller;

import com.example.demo.model.dto.HealthRecordDTO;
import com.example.demo.model.dto.PatientDTO;
import com.example.demo.service.CompanionService;
import com.example.demo.utility.GetCurrentUserInfo;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/companion")
@Slf4j
public class CompanionController {

    private final GetCurrentUserInfo getCurrentUserInfo;
    private final CompanionService companionService;



    @Autowired
    public CompanionController(GetCurrentUserInfo getCurrentUserInfo, CompanionService companionService) {
        this.getCurrentUserInfo = getCurrentUserInfo;
        this.companionService = companionService;
    }

    @GetMapping("/patientInfo")
    public ResponseEntity<PatientDTO> getPatientInfo(@RequestHeader("Authorization") String token) {
        try {
            PatientDTO patientDTO = companionService.getPatientDTOForCompanion(token);

            if (patientDTO == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
            }

            return ResponseEntity.ok(patientDTO);

        } catch (Exception e) {
            log.error("Error getting patient info for companion", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    @GetMapping("/bind-patient-records")
    public List<HealthRecordDTO> getBindPatientHealthRecordsForCompanion(@RequestHeader("Authorization") String token) {
           try{
               return companionService.getAllRecordsForCompanion(token);
           } catch (Exception e) {
               log.error("Error getting health records for companion", e);
               return null;
           }
    }

    @PostMapping("/bind")
    public ResponseEntity<String> bindPatient(@RequestHeader("Authorization") String token, @RequestParam String uuid) {

        Long companionId = getCurrentUserInfo.getCurrentUserId(token);

        boolean success = companionService.bindCompanionToPatient(companionId, uuid);
        if (success) {
            return ResponseEntity.ok("Companion bound to patient successfully");
        } else {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to bind companion to patient");
        }
    }


}
