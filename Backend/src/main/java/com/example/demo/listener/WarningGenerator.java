package com.example.demo.listener;

import com.example.demo.model.WarningRecord;
import com.example.demo.model.message.AnalyseRequest;
import com.example.demo.model.userimpl.Patient;
import com.example.demo.repository.AccountDao;
import com.example.demo.repository.PatientDao;
import com.example.demo.repository.WarningRecordRepository;
import com.example.demo.service.HealthRecordService;
import com.example.demo.service.ai.AiAnalyserService;
import com.example.demo.utility.converter.PromptConverter;
import com.example.demo.utility.GetCurrentUserInfo;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

import java.util.concurrent.CompletableFuture;

@Slf4j
@Component
public class WarningGenerator {
    public final AiAnalyserService aiAnalyserService;
    public final GetCurrentUserInfo getCurrentUserInfo;
    public final HealthRecordService healthRecordService;
    public final SimpMessagingTemplate messagingTemplate;
    public final WarningRecordRepository warningRecordRepository;
    public final AccountDao accountDao;

    @Autowired
    public WarningGenerator(AiAnalyserService aiAnalyserService, GetCurrentUserInfo getCurrentUserInfo, HealthRecordService healthRecordService, SimpMessagingTemplate messagingTemplate, WarningRecordRepository warningRecordRepository, AccountDao accountDao) {
        this.aiAnalyserService = aiAnalyserService;
        this.getCurrentUserInfo = getCurrentUserInfo;
        this.healthRecordService = healthRecordService;
        this.messagingTemplate = messagingTemplate;
        this.warningRecordRepository = warningRecordRepository;
        this.accountDao = accountDao;

        log.info("AiAnalyserListener initialized with dependencies");
    }

    @RabbitListener(queues = "new.record.to.ai.analyser")
    public void handleCurrentRecordAnalyse(AnalyseRequest request) {
        log.info("Received AnalyseRequest for accountId: {}", request.getAccountId());

        String currentRecord = request.getContent();
        System.out.printf("=========================================received currentRecord: %s\n", currentRecord);
        long accountId = request.getAccountId();
        log.debug("Processing current record: {}", currentRecord);
        log.info("Fetching recent records for accountId: {}", accountId);
        String recentRecords = PromptConverter.parseRecentHealthRecordsToPrompt(healthRecordService.getCertainDaysRecords(accountId, 10), true);
        log.info("Recent records parsed: {}", recentRecords);

        log.info("Analyzing current record with AI service");
        String result = aiAnalyserService.analyseCurrentRecord(currentRecord, recentRecords);
        log.info("Analysis result: {}", result);
        CompletableFuture.runAsync(() -> {
            try {
                Patient patient = accountDao.findById(accountId).get().getPatient();
                warningRecordRepository.save(new WarningRecord(result, patient));
            } catch (Exception e) {
                log.error("Error sending health report to chatbot: ", e);
            }
        });
        String destination = "/topic/analysis-result/" + accountId;
        log.info("Sending analysis result to WebSocket destination: {}", destination);
        try {
            messagingTemplate.convertAndSend(destination, result);
            log.info("Analysis result sent successfully to accountId: {}", accountId);
        } catch (Exception e) {
            log.error("Error sending analysis result to WebSocket for accountId: {}", accountId, e);
        }
    }


}