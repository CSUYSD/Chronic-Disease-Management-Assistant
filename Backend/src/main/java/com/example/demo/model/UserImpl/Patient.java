package com.example.demo.model.UserImpl;

import java.util.ArrayList;
import java.util.List;

import com.example.demo.model.Account;
import com.example.demo.model.User;
import com.fasterxml.jackson.annotation.JsonManagedReference;

import jakarta.persistence.*;

@Entity
@Table(name = "patients")
public class Patient extends User {
        // 关联到 Account 表
        @OneToMany(mappedBy = "patient", fetch = FetchType.EAGER)
        @JsonManagedReference
        private List<Account> accounts = new ArrayList<>();

        @OneToOne(mappedBy = "patient")
        private Companion companion;

        @Column(name = "random_string")
        private String randomString;

        public String getRandomString() {
                return randomString;
        }

        public void setRandomString(String randomString) {
                this.randomString = randomString;
        }

        // 确保有 getter 方法
        public List<Account> getAccounts() {
                return accounts;
        }

        // 其他必要的方法...
}