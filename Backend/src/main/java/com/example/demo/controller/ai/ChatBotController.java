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
import org.springframework.ai.vectorstore.ChromaVectorStore;
import org.springframework.ai.vectorstore.SearchRequest;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.beans.factory.ListableBeanFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/ai/chat")
@Slf4j
public class ChatBotController {
    @Autowired ChromaVectorStore chromaVectorStore;
    private final OpenAiChatModel openAiChatModel;
    private final ChatMemory chatMemory = new InMemoryChatMemory();
    private final ListableBeanFactory applicationContext;

    private String currentConversationId = "";
    @Autowired
    private GetCurrentUserInfo getCurrentUserInfo;

    public ChatBotController(OpenAiChatModel openAiChatModel, ListableBeanFactory applicationContext) {
        this.openAiChatModel = openAiChatModel;
        this.applicationContext = applicationContext;
    }


    @SneakyThrows
    @PostMapping(value = "/rag")
    public String chat(@RequestBody AiMessageWrapper input, @RequestHeader("Authorization") String token) {
        String[] functionBeanNames = new String[0];
        // 如果启用Agent则获取Agent的bean
        if (input.getParams().getEnableAgent()) {
            // 获取带有Agent注解的bean
            Map<String, Object> beansWithAnnotation = applicationContext.getBeansWithAnnotation(Agent.class);
            functionBeanNames = new String[beansWithAnnotation.keySet().size()];
            functionBeanNames = beansWithAnnotation.keySet().toArray(functionBeanNames);
            System.out.printf("================functionBeanNames: %s\n", functionBeanNames);
            input.getMessage().setAccountId(String.valueOf(getCurrentUserInfo.getCurrentAccountId(getCurrentUserInfo.getCurrentUserId(token))));
        }
        currentConversationId = String.valueOf(input.getMessage().getConversationId());

        return ChatClient.create(openAiChatModel).prompt()
                .user(promptUserSpec -> buildPrompt(promptUserSpec, input.getMessage()))
                // 2. QuestionAnswerAdvisor会在运行时替换模板中的占位符`question_answer_context`，替换成向量数据库中查询到的文档。此时的query=用户的提问+替换完的提示词模板;
//                .advisors(new QuestionAnswerAdvisor(chromaVectorStore, SearchRequest.defaults(), promptWithContext))
                .functions(functionBeanNames)
                .advisors(advisorSpec -> {
                    // 使用历史消息
                    useChatHistory(advisorSpec, String.valueOf(input.getMessage().getConversationId()));
                    // 使用向量数据库
                    useVectorStore(advisorSpec, input.getParams().getEnableVectorStore());
                })
                .call()
                // 3. query发送给大模型得到答案
                .content();
    }


    private void buildPrompt(ChatClient.PromptUserSpec promptUserSpec, InputMessage message) {
        String m = message.getMessage() + "My account id is " + message.getAccountId();
        promptUserSpec.text(m);
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
        log.info("Chat bot received health report from AI analyser");
        chatMemory.add(currentConversationId, new SystemMessage(report));
    }

    public void useChatHistory(ChatClient.AdvisorSpec advisorSpec, String sessionId) {
        // 1. 如果需要存储会话和消息到数据库，自己可以实现ChatMemory接口，这里使用自己实现的AiMessageChatMemory，数据库存储。
        // 2. 传入会话id，MessageChatMemoryAdvisor会根据会话id去查找消息。
        // 3. 只需要携带最近10条消息
        // MessageChatMemoryAdvisor会在消息发送给大模型之前，从ChatMemory中获取会话的历史消息，然后一起发送给大模型。
        advisorSpec.advisors(new MessageChatMemoryAdvisor(chatMemory, sessionId, 10));
    }

    public void useVectorStore(ChatClient.AdvisorSpec advisorSpec, Boolean enableVectorStore) {
        if (!enableVectorStore) return;
        // question_answer_context是一个占位符，会替换成向量数据库中查询到的文档。QuestionAnswerAdvisor会替换。
        String promptWithContext = """
                下面是上下文信息
                ---------------------
                {question_answer_context}
                ---------------------
                给定的上下文和提供的历史信息，而不是事先的知识，回复用户的意见。如果答案不在上下文中，告诉用户你不能回答这个问题。
                """;
        advisorSpec.advisors(new QuestionAnswerAdvisor(chromaVectorStore, SearchRequest.defaults(), promptWithContext));
    }

}


