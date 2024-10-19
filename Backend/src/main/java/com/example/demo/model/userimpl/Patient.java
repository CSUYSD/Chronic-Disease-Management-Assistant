package com.example.demo.model.userimpl;

import java.util.ArrayList;
import java.util.List;

import com.example.demo.model.Account;
import com.example.demo.model.User;
import com.fasterxml.jackson.annotation.JsonManagedReference;

import jakarta.persistence.*;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;

@Entity
@Data
public class Patient extends User {
    // 确保有 getter 方法
    // 关联到 Account 表
        @Getter
        @OneToMany(mappedBy = "patient", fetch = FetchType.LAZY)
        @JsonManagedReference
        private List<Account> accounts = new ArrayList<>();

        @OneToOne(mappedBy = "patient")
        @JsonManagedReference
        private Companion companion;

        @Setter
        @Getter
        @Column(name = "random_string", nullable = false)
        private String randomString;

    // 其他必要的方法...
}