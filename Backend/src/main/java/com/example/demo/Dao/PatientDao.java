package com.example.demo.Dao;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.demo.model.UserImpl.Patient;


public interface PatientDao extends JpaRepository<Patient, Long> {
    public Optional<Patient> findPatientByUsername(String username);
}

