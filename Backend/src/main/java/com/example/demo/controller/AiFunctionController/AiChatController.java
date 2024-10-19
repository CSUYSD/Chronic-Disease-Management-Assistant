package com.example.demo.controller.AiFunctionController;

import lombok.SneakyThrows;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.client.advisor.MessageChatMemoryAdvisor;
import org.springframework.ai.chat.client.advisor.QuestionAnswerAdvisor;
import org.springframework.ai.chat.memory.ChatMemory;
import org.springframework.ai.chat.memory.InMemoryChatMemory;
import org.springframework.ai.chat.messages.SystemMessage;
import org.springframework.ai.document.Document;
import org.springframework.ai.openai.OpenAiChatModel;
import org.springframework.ai.reader.tika.TikaDocumentReader;
import org.springframework.ai.transformer.splitter.TokenTextSplitter;
import org.springframework.ai.vectorstore.ChromaVectorStore;
import org.springframework.ai.vectorstore.SearchRequest;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.InputStreamResource;
import org.springframework.core.io.Resource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.http.codec.ServerSentEvent;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import reactor.core.publisher.Flux;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/ai/chat")
@Slf4j
public class AiChatController {
    @Autowired ChromaVectorStore chromaVectorStore;
    private final OpenAiChatModel openAiChatModel;
    private final ChatMemory chatMemory = new InMemoryChatMemory();


    private String currentConversationId = "";

    public AiChatController(OpenAiChatModel openAiChatModel) {
        this.openAiChatModel = openAiChatModel;
    }


    @SneakyThrows
    @GetMapping(value = "/rag", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public String chatStreamWithVectorDB(@RequestParam String prompt, @RequestParam String conversationId) {
        // 1. 定义提示词模板，question_answer_context会被替换成向量数据库中查询到的文档。
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
                // 2. QuestionAnswerAdvisor会在运行时替换模板中的占位符`question_answer_context`，替换成向量数据库中查询到的文档。此时的query=用户的提问+替换完的提示词模板;
                .advisors(new QuestionAnswerAdvisor(chromaVectorStore, SearchRequest.defaults(), promptWithContext))
                .advisors(new MessageChatMemoryAdvisor(chatMemory, conversationId, 10))
                .call()
                // 3. query发送给大模型得到答案
                .content();
    }

    //streaming chat with memory use SSE pipeline.
    @GetMapping(value = "/general", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public String chatStream(@RequestParam String prompt, @RequestParam String sessionId) {
        MessageChatMemoryAdvisor messageChatMemoryAdvisor = new MessageChatMemoryAdvisor(chatMemory, sessionId, 10);
        return ChatClient.create(openAiChatModel).prompt()
                .user(prompt)
                .advisors(messageChatMemoryAdvisor)
                .call() //流式返回
                .content();
    }

    @RabbitListener(queues = "health.report.to.chatbot")
    public void receiveHealthReport(String report) {
        log.info("Chat bot received health report from AI analyser: {}", report);
        chatMemory.add(currentConversationId, new SystemMessage(report));
    }

}
