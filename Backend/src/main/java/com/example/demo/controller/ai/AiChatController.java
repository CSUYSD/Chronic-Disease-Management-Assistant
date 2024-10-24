package com.example.demo.controller.ai;

import lombok.SneakyThrows;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.client.advisor.MessageChatMemoryAdvisor;
import org.springframework.ai.chat.client.advisor.QuestionAnswerAdvisor;
import org.springframework.ai.chat.memory.ChatMemory;
import org.springframework.ai.chat.memory.InMemoryChatMemory;
import org.springframework.ai.chat.messages.SystemMessage;
import org.springframework.ai.openai.OpenAiChatModel;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.ai.vectorstore.SearchRequest;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/ai/chat")
@Slf4j
public class AiChatController {
    @Autowired
    private VectorStore vectorStore; // 使用 VectorStore 接口替代 ChromaVectorStore

    private final OpenAiChatModel openAiChatModel;
    private final ChatMemory chatMemory = new InMemoryChatMemory();

    private String currentConversationId = "";

    public AiChatController(OpenAiChatModel openAiChatModel) {
        this.openAiChatModel = openAiChatModel;
    }

    @SneakyThrows
    @GetMapping(value = "/rag", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public String chatStreamWithVectorDB(@RequestParam String prompt, @RequestParam String conversationId) {
        String promptWithContext = """
                Below is the context information:
                ---------------------
                {question_answer_context}
                ---------------------
                Please respond based on the provided context and historical information, rather than using prior knowledge. If the answer is not present in the context, let the user know that you don't know the answer.
                """;
        currentConversationId = conversationId;
        return ChatClient.create(openAiChatModel).prompt()
                .user(prompt)
                .advisors(new QuestionAnswerAdvisor(vectorStore, SearchRequest.defaults(), promptWithContext))
                .advisors(new MessageChatMemoryAdvisor(chatMemory, conversationId, 10))
                .call()
                .content();
    }

    @GetMapping(value = "/general", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public String chatStream(@RequestParam String prompt, @RequestParam String sessionId) {
        MessageChatMemoryAdvisor messageChatMemoryAdvisor = new MessageChatMemoryAdvisor(chatMemory, sessionId, 10);
        return ChatClient.create(openAiChatModel).prompt()
                .user(prompt)
                .advisors(messageChatMemoryAdvisor)
                .call()
                .content();
    }

    @RabbitListener(queues = "health.report.to.chatbot")
    public void receiveHealthReport(String report) {
        log.info("Chat bot received health report from AI analyser");
        chatMemory.add(currentConversationId, new SystemMessage(report));
    }
}