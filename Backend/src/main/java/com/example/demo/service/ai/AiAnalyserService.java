package com.example.demo.service.ai;

import com.example.demo.model.HealthReport;
import com.example.demo.model.dto.HealthRecordDTO;
import com.example.demo.model.userimpl.Patient;
import com.example.demo.repository.HealthReportRepository;
import com.example.demo.service.HealthRecordService;
import com.example.demo.service.rabbitmq.RabbitMQService;
import com.example.demo.utility.converter.PromptConverter;
import com.example.demo.utility.jwt.JwtUtil;
import com.example.demo.utility.GetCurrentUserInfo;
import com.example.demo.utility.prompt.PromptManager;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.client.advisor.QuestionAnswerAdvisor;
import org.springframework.ai.chat.messages.Message;
import org.springframework.ai.chat.messages.UserMessage;
import org.springframework.ai.chat.model.Generation;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.ai.chat.prompt.SystemPromptTemplate;
import org.springframework.ai.openai.OpenAiChatModel;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.ai.vectorstore.SearchRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.concurrent.CompletableFuture;

@Service
@Slf4j
public class AiAnalyserService {
    public final OpenAiChatModel openAiChatModel;
    public final JwtUtil jwtUtil;
    public final GetCurrentUserInfo getCurrentUserInfo;
    public final VectorStore vectorStore;
    public final HealthRecordService healthRecordService;
    public final PromptManager promptManager;
    private final RabbitMQService rabbitMQService;
    private final HealthReportRepository healthReportRepository;

    @Autowired
    public AiAnalyserService(OpenAiChatModel openAiChatModel, JwtUtil jwtUtil, GetCurrentUserInfo getCurrentUserInfo, VectorStore vectorStore, HealthRecordService healthRecordService, PromptManager promptManager, RabbitMQService rabbitMQService, HealthReportRepository healthReportRepository) {
        this.openAiChatModel = openAiChatModel;
        this.jwtUtil = jwtUtil;
        this.getCurrentUserInfo = getCurrentUserInfo;
        this.vectorStore = vectorStore;
        this.healthRecordService = healthRecordService;
        this.promptManager = promptManager;
        this.rabbitMQService = rabbitMQService;
        this.healthReportRepository = healthReportRepository;
    }

    public String analyseCurrentRecord(String currentRecord, String recentRecords) {
        String context = """
    You are analyzing a recent blood pressure record to assess if it indicates potential health risks for a hypertension patient.
    
    Recent blood pressure and symptom records for reference:
    ---------------------
    {context}
    ---------------------
    Use the above records only for context and do not include them directly in your reply.
    
    Instructions:
    - Begin your reply with 'WARNING' only if the current record shows significant risk factors or unusual symptoms for a hypertension patient. Examples include:
        - Sudden increase in SBP (Systolic Blood Pressure) or DBP (Diastolic Blood Pressure) beyond safe levels, compared to recent records.
        - Presence of critical symptoms like chest pain, severe headache, or less urination which may indicate worsening health conditions.
        - Persistent or new symptoms like chest pain or severe headache that were not previously recorded.
    - If the record does not indicate immediate risk, provide a brief summary, such as "No critical changes detected."
    
    Keep your response under 50 words.
    
    """;

        try {
            Message userMessage = new UserMessage("Here is my current record: " + currentRecord);

            SystemPromptTemplate systemPromptTemplate = new SystemPromptTemplate(context);

            Message systemMessage = systemPromptTemplate.createMessage(Map.of("context", recentRecords));

            Prompt prompt = new Prompt(List.of(userMessage, systemMessage));
            List<Generation> generations = openAiChatModel.call(prompt).getResults();
            return generations.toString();
        } catch (Exception e) {
            return "Error: " + e.getMessage();
        }
    }


    public String generateOverAllHealthReport(String token) {
        Long userId = getCurrentUserInfo.getCurrentUserId(token);
        Long accountId = getCurrentUserInfo.getCurrentAccountId(userId);
        List<HealthRecordDTO> records = healthRecordService.getCertainDaysRecords(accountId, 10);
        String recentRecords = PromptConverter.parseRecentHealthRecordsToPrompt(records, false);

        String context = promptManager.getHealthReportPrompt(recentRecords);
        String prompt = String.format(promptManager.getHealthReportContext(), recentRecords);

        ChatClient chatClient = ChatClient.create(openAiChatModel);
        String response = chatClient.prompt()
                .user(prompt)
                .advisors(new QuestionAnswerAdvisor(vectorStore, SearchRequest.defaults(), context))
                .call()
                .content();

        // Async sending message to chatbot
        CompletableFuture.runAsync(() -> {
            try {
                rabbitMQService.sendHealthReportToChatbot(response);
            } catch (Exception e) {
                log.error("Error sending health report to chatbot: ", e);
            }
        });

        // Async saving health report to database
        CompletableFuture.runAsync(() -> {
            try {
                Patient patient = getCurrentUserInfo.getCurrentPatientEntity(token);
                healthReportRepository.save(new HealthReport(response, patient));
            } catch (Exception e) {
                log.error("Error sending health report to chatbot: ", e);
            }
        });
        return response;
    }
}
