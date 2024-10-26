package com.example.demo.agent.agentImpl;

import com.example.demo.agent.Agent;
import com.example.demo.agent.AbstractAgent;
import com.example.demo.model.dto.HealthRecordDTO;
import com.example.demo.service.HealthRecordService;
import com.example.demo.utility.converter.PromptConverter;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonPropertyDescription;
import org.springframework.ai.chat.model.ChatModel;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Description;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.function.Function;
import java.util.stream.Collectors;

@Agent
@Description("provide user request data")
public class RecordAnalyzer extends AbstractAgent<RecordAnalyzer.Request, String> {

    protected RecordAnalyzer(ChatModel chatModel) {
        super(chatModel);
    }

    public record Request(
            @JsonProperty(required = true) @JsonPropertyDescription("user message") String content
    ) {}

    @Override
    public String apply(Request request) {

        return getChatClient()
                .prompt()
                .user(request.content)
                .call()
                .content();
    }

    @Component("recent_records_reader")
    @Description("get user's recent records from database")
    public static class RecentRecordsReader implements Function<RecentRecordsReader.Request, String> {
        private final HealthRecordService recordService;

        @Autowired
        public RecentRecordsReader(HealthRecordService recordService1) {
            this.recordService = recordService1;
        }

        @Override
        public String apply(Request request) {
            List<HealthRecordDTO> recentRecords = recordService
                    .getCertainDaysRecords(Long.valueOf(request.accountId), 20)
                    .stream()
                    .limit(20)
                    .collect(Collectors.toList());

            return PromptConverter.parseRecentHealthRecordsToPrompt(recentRecords, false);
        }

        public record Request(
                @JsonProperty(required = true)
                @JsonPropertyDescription("user's account id")
                String accountId,
                @JsonProperty(required = true)
                @JsonPropertyDescription("user requirement")
                String message
        ) {}


    }
}
