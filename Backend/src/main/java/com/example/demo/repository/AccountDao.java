package com.example.demo.repository;


import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.example.demo.model.Account;
import com.example.demo.model.userimpl.Patient;

@Repository
public interface AccountDao extends JpaRepository<Account, Long> {

    @Query("SELECT a.id FROM Account a WHERE a.accountName = ?1 AND a.patient.id = ?2")
    Long findAccountIdByAccountNameAndPatientId(String accountName, Long patientId);

    List<Account> findByPatient(Patient patient);

}
