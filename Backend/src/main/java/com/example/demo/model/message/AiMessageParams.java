package com.example.demo.model.message;

import lombok.Data;

@Data
public class AiMessageParams {
    Boolean enableVectorStore;
    Boolean enableAgent;
}