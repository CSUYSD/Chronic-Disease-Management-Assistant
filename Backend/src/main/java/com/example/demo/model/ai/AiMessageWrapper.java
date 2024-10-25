package com.example.demo.model.ai;


import lombok.Data;

import java.util.Map;

@Data
public class AiMessageWrapper {
    private InputMessage message;      // 用户原始消息
    private ChatParameters params;    // 聊天参数
}

