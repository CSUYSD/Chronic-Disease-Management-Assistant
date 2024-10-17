package com.example.demo.model.UserImpl;

import com.example.demo.model.User;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;

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
