package com.example.demo.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.demo.model.userimpl.Patient;
import org.springframework.stereotype.Repository;

@Repository
public interface PatientDao extends JpaRepository<Patient, Long> {
    Optional<Object> findByRandomString(String randomString);
    public Optional<Object> findByUsername(String username);

}

