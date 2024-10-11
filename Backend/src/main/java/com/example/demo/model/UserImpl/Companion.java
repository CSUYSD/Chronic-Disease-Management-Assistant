package com.example.demo.model.UserImpl;

import com.example.demo.model.User;

import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "companions")
public class Companion extends User {
    @OneToOne
    @JoinColumn(name = "patient_id")
    private Patient patient;

    public void setPatient(Patient patient) {
        this.patient = patient;
    }
}
