package com.example.demo.service.ai;

import com.example.demo.utility.jwt.JwtUtil;
import com.example.demo.utility.GetCurrentUserInfo;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.client.advisor.QuestionAnswerAdvisor;
import org.springframework.ai.chat.messages.Message;
import org.springframework.ai.chat.messages.UserMessage;
import org.springframework.ai.chat.model.Generation;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.ai.chat.prompt.SystemPromptTemplate;
import org.springframework.ai.openai.OpenAiChatModel;
import org.springframework.ai.vectorstore.ChromaVectorStore;
import org.springframework.ai.vectorstore.SearchRequest;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
@Slf4j
public class AiAnalyserService {
    public final OpenAiChatModel openAiChatModel;
    public final JwtUtil jwtUtil;
    public final GetCurrentUserInfo getCurrentUserInfo;
    public final ChromaVectorStore vectorStore;

    @Autowired
    public AiAnalyserService(OpenAiChatModel openAiChatModel, JwtUtil jwtUtil, GetCurrentUserInfo getCurrentUserInfo, ChromaVectorStore vectorStore) {
        this.openAiChatModel = openAiChatModel;
        this.jwtUtil = jwtUtil;
        this.getCurrentUserInfo = getCurrentUserInfo;
        this.vectorStore = vectorStore;
    }


    public String analyseCurrentRecord(String currentRecord, String recentRecords) {
        String context = """
        Based on the following recent health records, generate a reply using the context provided.:
        ---------------------
        {context}
        ---------------------
        keep your response under 50 words, generate your response with 'WARNING' on the context following conditions:
        1. If you find this record is not stable compare with given context
        2. If the sbp and dbp of given record is higher than 140 and 90 respectively.
        """;
        try {
            Message userMessage = new UserMessage(currentRecord);

            SystemPromptTemplate systemPromptTemplate = new SystemPromptTemplate(context);

            Message systemMessage = systemPromptTemplate.createMessage(Map.of("context", recentRecords) );

            Prompt prompt = new Prompt(List.of(userMessage, systemMessage));
            List<Generation> generations = openAiChatModel.call(prompt).getResults();
            return generations.toString();
        } catch (Exception e) {
            return "Error: " + e.getMessage();
        }
    }

// 新功能，未完成
//    public String generateOverAllHealthReport(String recentRecords) {
//        String context = """
//        Based on the following recent health records, generate a reply using the context provided.:
//        ---------------------
//        {question_answer_context}
//        ---------------------
//        keep your response under 50 words, generate your response with 'WARNING' on the context following conditions:
//        1. If you find this record is not stable compare with given context
//        2. If the sbp and dbp of given record is higher than 140 and 90 respectively.
//        """;
//        ChatClient chatClient = ChatClient.create(openAiChatModel);
//        return chatClient.prompt()
//                .user(prompt)
//                .function()
//                .advisors(new QuestionAnswerAdvisor(vectorStore, SearchRequest.defaults(), context))
//                .call()
//                .content();
//    }
}

