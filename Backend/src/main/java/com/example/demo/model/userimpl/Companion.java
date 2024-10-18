package com.example.demo.model.userimpl;

import com.example.demo.model.User;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;

@Entity
public class Companion extends User {
    @OneToOne
    @JoinColumn(name = "patient_id")
    @JsonBackReference
    private Patient patient;

    public void setPatient(Patient patient) {
        this.patient = patient;
    }
}
