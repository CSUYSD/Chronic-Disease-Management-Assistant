package com.example.demo.model.Redis;

import com.example.demo.model.HealthRecord;
import com.fasterxml.jackson.annotation.JsonTypeInfo;
import com.fasterxml.jackson.annotation.JsonTypeName;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
@Data
@NoArgsConstructor
@JsonTypeInfo(use = JsonTypeInfo.Id.NAME, include = JsonTypeInfo.As.PROPERTY, property = "@class")
@JsonTypeName("com.example.demo.model.RedisAccount")
public class RedisAccount {
    private Long id;
    private String name;
    private Double total_income;
    private Double total_expense;
    private List<HealthRecord> records;

    public RedisAccount(Long id, String name, Double total_income, Double total_expense, List<HealthRecord> records) {
        this.id = id;
        this.name = name;
        this.total_income = total_income;
        this.total_expense = total_expense;
        this.records = records;
    }
}