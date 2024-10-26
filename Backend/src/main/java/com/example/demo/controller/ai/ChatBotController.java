package com.example.demo.controller.ai;

import com.example.demo.agent.Agent;
import com.example.demo.model.ai.AiMessageWrapper;
import com.example.demo.model.ai.InputMessage;
import com.example.demo.utility.GetCurrentUserInfo;
import lombok.SneakyThrows;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.client.advisor.MessageChatMemoryAdvisor;
import org.springframework.ai.chat.client.advisor.QuestionAnswerAdvisor;
import org.springframework.ai.chat.memory.ChatMemory;
import org.springframework.ai.chat.memory.InMemoryChatMemory;
import org.springframework.ai.chat.messages.SystemMessage;
import org.springframework.ai.openai.OpenAiChatModel;
import org.springframework.ai.vectorstore.SearchRequest;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.beans.factory.ListableBeanFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationContext;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

import static io.lettuce.core.GeoArgs.Unit.m;

@RestController
@RequestMapping("/ai/chat")
@Slf4j
public class ChatBotController {
    private final VectorStore vectorStore;
    private final OpenAiChatModel openAiChatModel;
    private final ApplicationContext applicationContext;
    private final GetCurrentUserInfo getCurrentUserInfo;
    @Autowired
    public ChatBotController(VectorStore vectorStore, OpenAiChatModel openAiChatModel, ApplicationContext applicationContext, ApplicationContext applicationContext1, GetCurrentUserInfo getCurrentUserInfo) {
        this.vectorStore = vectorStore;
        this.openAiChatModel = openAiChatModel;
        this.applicationContext = applicationContext;
        this.getCurrentUserInfo = getCurrentUserInfo;
    }
    private String currentConversationId = "";
    private final ChatMemory chatMemory = new InMemoryChatMemory();

    @SneakyThrows
    @PostMapping(value = "/rag")
    public String chat(@RequestBody AiMessageWrapper input, @RequestHeader("Authorization") String token) {
        String[] functionBeanNames = new String[0];
        // 如果启用Agent则获取Agent的bean
        if (input.getParams().getEnableAgent()) {
            // get all beans with annotation Agent
            Map<String, Object> beansWithAnnotation = applicationContext.getBeansWithAnnotation(Agent.class);
            functionBeanNames = new String[beansWithAnnotation.keySet().size()];
            functionBeanNames = beansWithAnnotation.keySet().toArray(functionBeanNames);
            System.out.printf("================functionBeanNames: %s\n", functionBeanNames);
            input.getInputMessage().setAccountId(String.valueOf(getCurrentUserInfo.getCurrentAccountId(getCurrentUserInfo.getCurrentUserId(token))));
        }

        return ChatClient.create(openAiChatModel).prompt()
                .user(promptUserSpec -> buildPrompt(promptUserSpec, input))
                .functions(functionBeanNames)
                .advisors(advisorSpec -> {
                    // use chat memory
                    useChatHistory(advisorSpec, String.valueOf(input.getInputMessage().getConversationId()));
                    // use vector db
                    useVectorStore(advisorSpec, input.getParams().getEnableVectorStore());
                })
                .call()
                .content();
    }


    private void buildPrompt(ChatClient.PromptUserSpec promptUserSpec, AiMessageWrapper message) {
        if (message.getParams().getEnableAgent()){
            String m = message.getInputMessage().getMessage() + "My account id is " + message.getInputMessage().getAccountId();
            promptUserSpec.text(m);
        } else {
            promptUserSpec.text(message.getInputMessage().getMessage());
        }
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

    public void useChatHistory(ChatClient.AdvisorSpec advisorSpec, String sessionId) {
        advisorSpec.advisors(new MessageChatMemoryAdvisor(chatMemory, sessionId, 10));
    }

    public void useVectorStore(ChatClient.AdvisorSpec advisorSpec, Boolean enableVectorStore) {
        if (!enableVectorStore) return;
        String promptWithContext = """
                Below is the context information:
                ---------------------
                {question_answer_context}
                ---------------------
                Please respond based on the provided context and historical information, rather than using prior knowledge. If the answer is not present in the context, let the user know that you don't know the answer.
                """;
        advisorSpec.advisors(new QuestionAnswerAdvisor(vectorStore, SearchRequest.defaults(), promptWithContext));
    }

}


