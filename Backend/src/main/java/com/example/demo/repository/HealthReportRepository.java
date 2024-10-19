package com.example.demo.repository;

import com.example.demo.model.HealthReport;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface HealthReportRepository extends JpaRepository<HealthReport, Long> {
    @Query(value = "SELECT * FROM health_report WHERE patient_id = ?1", nativeQuery = true)
    List<HealthReport> findAllHealthReportsByPatientId(Long patientId);
}
