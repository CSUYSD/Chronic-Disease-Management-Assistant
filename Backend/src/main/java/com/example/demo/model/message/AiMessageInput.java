package com.example.demo.model.message;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class AiMessageInput {
    String content;
    String conversationId;


    public AiMessageInput(String content, String conversationId) {
        this.content = content;
        this.conversationId = conversationId;
    }
}
