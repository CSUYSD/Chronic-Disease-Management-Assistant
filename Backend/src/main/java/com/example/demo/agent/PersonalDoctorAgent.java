package com.example.demo.agent;


import com.example.demo.model.HealthRecord;
import com.example.demo.model.HealthReport;
import com.example.demo.repository.HealthReportRepository;
import com.example.demo.repository.RecordDao;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonPropertyDescription;
import lombok.RequiredArgsConstructor;
import org.springframework.ai.chat.model.ChatModel;
import org.springframework.context.annotation.Description;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.List;
import java.util.Objects;
import java.util.function.Function;


@Agent
@Description("A personal doctor assistant that can analyze users' health records and reports, providing health recommendations.")
public class PersonalDoctorAgent extends AbstractAgent<PersonalDoctorAgent.Request, String> {


    protected PersonalDoctorAgent(ChatModel chatModel) {
        super(chatModel);
    }

    @Override
    public String apply(Request request) {
        return getChatClient()
                .prompt()
                .user(request.query())
                .call()
                .content();
    }

    public record Request(
            @JsonProperty(required = true)
            @JsonPropertyDescription(value = "user's health related problem")
            String query) {
    }

    @Component("health_record_analyzer")
    @RequiredArgsConstructor
    @Description("Analyze user's last 30 health records, including blood pressure and symptoms data")
    public static class HealthRecordAnalyzer implements Function<HealthRecordAnalyzer.Request, String> {

        private final RecordDao recordDao;

        @Override
        public String apply(HealthRecordAnalyzer.Request request) {
            // Get user's last 30 health records
            ZonedDateTime duration = LocalDateTime.now()
                    .minusDays(30)
                    .atZone(ZoneId.systemDefault());

            List<HealthRecord> recentRecords = recordDao
                    .findByUserIdAndImportTimeAfterOrderByImportTimeDesc(
                            request.patientId,
                            duration  // 使用 ZonedDateTime
                    );

            StringBuilder analysis = new StringBuilder();
            analysis.append("Health Record Analysis for Last 30 Days:\n\n");

            // Blood pressure trend analysis
            analysis.append("Blood Pressure Trends:\n");
            for (HealthRecord record : recentRecords) {
                analysis.append(String.format("Date: %s, BP: %d/%d mmHg\n",
                        record.getImportTime(),
                        record.getSbp(),
                        record.getDbp()
                ));
            }

            // Symptom analysis
            analysis.append("\nSymptom Records:\n");
            for (HealthRecord record : recentRecords) {
                if (Objects.equals(record.getIsHeadache(), "yes") ||
                        Objects.equals(record.getIsBackPain(), "yes") ||
                        Objects.equals(record.getIsChestPain(), "yes") ||
                        Objects.equals(record.getIsLessUrination(), "yes")) {

                    analysis.append(String.format("Date: %s\n", record.getImportTime()));

                    if (Objects.equals(record.getIsHeadache(), "yes"))
                        analysis.append("- Headache\n");
                    if (Objects.equals(record.getIsBackPain(), "yes"))
                        analysis.append("- Back Pain\n");
                    if (Objects.equals(record.getIsChestPain(), "yes"))
                        analysis.append("- Chest Pain\n");
                    if (Objects.equals(record.getIsLessUrination(), "yes"))
                        analysis.append("- Reduced Urination\n");
                }
            }

            return analysis.toString();
        }

        public record Request(
                @JsonProperty(required = true)
                @JsonPropertyDescription("Patient ID")
                Long patientId
        ) {
        }
    }

    @Component("health_report_analyzer")
    @RequiredArgsConstructor
    @Description("Analyze user's historical health reports and provide long-term health trend analysis")
    public static class HealthReportAnalyzer implements Function<HealthReportAnalyzer.Request, String> {

        private final HealthReportRepository healthReportRepository;

        @Override
        public String apply(HealthReportAnalyzer.Request request) {
            // Get all health reports for the user
            List<HealthReport> reports = healthReportRepository
                    .findAllHealthReportsByPatientId(request.patientId);

            StringBuilder analysis = new StringBuilder();
            analysis.append("Health Report History Analysis:\n\n");

            for (HealthReport report : reports) {
//          analysis.append(String.format("Report Date: %s\n", report.getCreatedAt()));
                analysis.append("Report Content:\n");
                analysis.append(report.getContent());
                analysis.append("\n\n");
            }

            // Summary analysis
            analysis.append("Overall Health Trends:\n");
            if (!reports.isEmpty()) {
                // Add more complex trend analysis logic here
                analysis.append("Based on historical reports:\n");
                // ... add more analysis
            } else {
                analysis.append("No historical health report records available.");
            }

            return analysis.toString();
        }


        public record Request(
                @JsonProperty(required = true)
                @JsonPropertyDescription("Patient ID")
                Long patientId
        ) {
        }
    }

}