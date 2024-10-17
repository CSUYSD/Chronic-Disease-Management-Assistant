package com.example.demo.Dao;

import java.util.Optional;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.springframework.data.jpa.repository.JpaRepository;

import com.example.demo.model.UserImpl.Patient;


public interface PatientDao extends JpaRepository<Patient, Long> {
    Optional<Object> findByRandomString(String randomString);

    public Optional<Object> findByUsername(String username);
}

