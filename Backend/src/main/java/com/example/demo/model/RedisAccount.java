package com.example.demo.model;

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


    public RedisAccount(Long id, String name) {
        this.id = id;
        this.name = name;
    }
}
