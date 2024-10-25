package com.example.demo.model.ai;

import lombok.Data;


@Data
public class AiMessageWrapper {
    private InputMessage inputMessage;
    private ChatParameters params;
}
