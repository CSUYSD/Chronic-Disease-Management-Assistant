package com.example.demo.model.message;

import lombok.Data;

@Data
public class AiMessageWrapper {
    AiMessageInput message;
    AiMessageParams params;
}