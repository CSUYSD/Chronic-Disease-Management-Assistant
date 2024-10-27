package com.example.demo.repository;

import com.example.demo.model.WarningRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface WarningRecordRepository extends JpaRepository<WarningRecord, Long> {
    @Query(value = "SELECT * FROM warning_record WHERE patient_id = ?1", nativeQuery = true)
    List<WarningRecord> findAllHealthReportsByPatientId(Long patientId);
}
