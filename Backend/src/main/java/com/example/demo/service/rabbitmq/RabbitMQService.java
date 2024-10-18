package com.example.demo.service.rabbitmq;

import com.example.demo.model.ai.AnalyseRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class RabbitMQService {
    private final RabbitTemplate rabbitTemplate;
    @Autowired
    public RabbitMQService(RabbitTemplate rabbitTemplate) {
        this.rabbitTemplate = rabbitTemplate;
    }

    public void sendAnalyseRequestToAIAnalyser(AnalyseRequest request) {
        log.info("Sending AnalyseRequest to AI analyser for accountId: {}", request.getAccountId());
        try {
            rabbitTemplate.convertAndSend("new.record.to.ai.analyser", request);
            log.info("AnalyseRequest sent successfully to AI analyser for accountId: {}", request.getAccountId());
        } catch (Exception e) {
            log.error("Error sending AnalyseRequest to AI analyser: {}", e.getMessage());
            throw new RuntimeException("Error sending AnalyseRequest to AI analyser: " + e.getMessage());
        }
    }
}
