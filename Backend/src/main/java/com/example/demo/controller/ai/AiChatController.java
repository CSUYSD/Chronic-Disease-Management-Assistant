package com.example.demo.controller.ai;

import com.example.demo.utility.GetCurrentUserInfo;
import lombok.SneakyThrows;
import lombok.extern.slf4j.Slf4j;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.client.advisor.MessageChatMemoryAdvisor;
import org.springframework.ai.chat.client.advisor.QuestionAnswerAdvisor;
import org.springframework.ai.chat.memory.ChatMemory;
import org.springframework.ai.chat.memory.InMemoryChatMemory;
import org.springframework.ai.chat.messages.SystemMessage;
import org.springframework.ai.chat.messages.UserMessage;
import org.springframework.ai.openai.OpenAiChatModel;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.ai.vectorstore.SearchRequest;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationContext;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

import com.example.demo.agent.Agent;
import com.example.demo.model.message.AiMessageWrapper;

@RestController
@RequestMapping("/ai/chat")
@Slf4j
public class AiChatController {
    @Autowired
    private VectorStore vectorStore; // 使用 VectorStore 接口替代 ChromaVectorStore

    private final OpenAiChatModel openAiChatModel;
    private final ApplicationContext applicationContext;
    private final ChatMemory chatMemory = new InMemoryChatMemory();
    private final GetCurrentUserInfo getCurrentUserInfo;

    private String currentConversationId = "";

    public AiChatController(OpenAiChatModel openAiChatModel, ApplicationContext applicationContext, GetCurrentUserInfo getCurrentUserInfo) {
        this.openAiChatModel = openAiChatModel;
        this.applicationContext = applicationContext;
        this.getCurrentUserInfo = getCurrentUserInfo;
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

    @GetMapping(value = "/function")
    public String chatStreamWithFunction(@RequestParam String prompt, @RequestParam String functionName) {
        return ChatClient.create(openAiChatModel).prompt()
                .messages(new UserMessage(prompt))
                // spring ai会从已注册为bean的function中查找函数，将它添加到请求中。如果成功触发就会调用函数
                .functions(functionName)
                .call()
                .content();
    }

    @PostMapping(value = "chat-with-agent")
    public String chat(@RequestHeader("Authorization") String token, @RequestBody AiMessageWrapper input) {
        String[] functionBeanNames = new String[0];
        // 如果启用Agent则获取Agent的bean
        if (input.getParams().getEnableAgent()) {
            // 获取带有Agent注解的bean
            Map<String, Object> beansWithAnnotation = applicationContext.getBeansWithAnnotation(Agent.class);
            functionBeanNames = new String[beansWithAnnotation.keySet().size()];
            functionBeanNames = beansWithAnnotation.keySet().toArray(functionBeanNames);
        }
        return ChatClient.create(openAiChatModel).prompt()
                .user(promptUserSpec -> buildPrompt(promptUserSpec, input.getMessage().getContent(),token))
                // agent list
                .functions(functionBeanNames)
                .advisors(advisorSpec -> {
                    // when input with conversationId, use chat history
                    useChatHistory(advisorSpec, input.getMessage().getConversationId());
                    // when input with enableVectorStore, use vector store
                    useVectorStore(advisorSpec, input.getParams().getEnableVectorStore());
                })
                .call()
                .content();
    }

    private void buildPrompt(ChatClient.PromptUserSpec promptUserSpec, String message, String token) {
        Long patientId = getCurrentUserInfo.getCurrentUserId(token);
        Long accountId = getCurrentUserInfo.getCurrentAccountId(patientId);
        message = message + "my current accountId " + accountId + "my current patientId" + patientId;
        promptUserSpec.text(message);
    }


    public void useChatHistory(ChatClient.AdvisorSpec advisorSpec, String conversationId) {
        advisorSpec.advisors(new MessageChatMemoryAdvisor(chatMemory, conversationId, 10));
    }

    public void useVectorStore(ChatClient.AdvisorSpec advisorSpec, Boolean enableVectorStore) {
        String promptWithContext = """
                Below is the context information:
                ---------------------
                {question_answer_context}
                ---------------------
                Please respond based on the provided context and historical information, rather than using prior knowledge. If the answer is not present in the context, let the user know that you don't know the answer.
                """;
        if (enableVectorStore) {
            advisorSpec.advisors(new QuestionAnswerAdvisor(vectorStore, SearchRequest.defaults(), promptWithContext));
        }
    }


    @RabbitListener(queues = "health.report.to.chatbot")
    public void receiveHealthReport(String report) {
        log.info("Chat bot received health report from AI analyser");
        chatMemory.add(currentConversationId, new SystemMessage(report));
    }
}