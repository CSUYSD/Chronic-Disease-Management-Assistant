package com.example.demo.model.userimpl;

import java.util.ArrayList;
import java.util.List;

import com.example.demo.model.*;
import com.fasterxml.jackson.annotation.JsonManagedReference;

import jakarta.persistence.*;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;

@Entity
public class Patient extends User {
        // 关联到 Account 表

        @OneToOne(mappedBy = "patient")
        @JsonManagedReference
        private Companion companion;

        @Setter
        @Getter
        @Column(name = "random_string", nullable = false)
        private String randomString;

        @Getter
        @OneToMany(mappedBy = "patient", fetch = FetchType.LAZY)
        @JsonManagedReference
        private List<Account> accounts = new ArrayList<>();

        @Getter
        @OneToMany(mappedBy = "patient", fetch = FetchType.LAZY)
        @JsonManagedReference
        private List<HealthReport> healthReports = new ArrayList<>();

        @Getter
        @OneToMany(mappedBy = "patient", fetch = FetchType.LAZY)
        @JsonManagedReference
        private List<WarningRecord> warningRecord = new ArrayList<>();

}