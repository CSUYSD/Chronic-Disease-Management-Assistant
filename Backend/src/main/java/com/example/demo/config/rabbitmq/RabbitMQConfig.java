package com.example.demo.config.rabbitmq;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {
    @Bean
    public Queue newRecordToAiAnalyserQueue() {
        return new Queue("new.record.to.ai.analyser", true);
    }

    @Bean
    public Queue healthReportToChatbotQueue() {return new Queue("health.report.to.chatbot", true); }

    @Bean
    public MessageConverter jsonMessageConverter() {
        return new Jackson2JsonMessageConverter();
    }

}
