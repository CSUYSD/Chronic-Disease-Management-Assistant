package com.example.demo.service.ai;

import com.example.demo.model.dto.HealthRecordDTO;
import com.example.demo.service.RecordService;
import com.example.demo.service.rabbitmq.RabbitMQService;
import com.example.demo.utility.converter.PromptConverter;
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
import java.util.concurrent.CompletableFuture;

@Service
@Slf4j
public class AiAnalyserService {
    public final OpenAiChatModel openAiChatModel;
    public final JwtUtil jwtUtil;
    public final GetCurrentUserInfo getCurrentUserInfo;
    public final ChromaVectorStore vectorStore;
    @Autowired public RecordService recordService;
    @Autowired
    private RabbitMQService rabbitMQService;

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
public String generateOverAllHealthReport(String token) {
    Long userId = getCurrentUserInfo.getCurrentUserId(token);
    Long accountId = getCurrentUserInfo.getCurrentAccountId(userId);
    List<HealthRecordDTO> records = recordService.getCertainDaysRecords(accountId, 10);
    String recentRecords = PromptConverter.parseRecentHealthRecordsToPrompt(records);

    String context = """
    Below is the context information (user's medical history):
    ---------------------
    {question_answer_context}
    ---------------------
    """;

    String prompt = String.format("""
        As the user's personal caregiver, review the following recent health records and the user's medical history:

        %s

        Provide a personalized health summarization addressing the user directly, adhering to these guidelines:
        1. Use a warm, conversational tone as if speaking directly to the patient.
        2. Synthesize information from both the recent health records and the user's medical history in the context.
        3. Do NOT format the response as a letter, email, or formal written communication.
        4. Avoid salutations like "Dear" or closings like "Warm regards."
        5. Limit the response to 300 english words or less.
        6. Format the entire response in well-structured Markdown.

        Your report should include:
        1. A friendly introduction summarizing their current health status.
        2. Key observations from their recent records and historical data.
        3. Potential areas of concern or improvement, expressed with care.
        4. Personalized lifestyle recommendations (avoid specific medical advice).
        
        This is an example of response:
            Hello, John Doe! Here's your health summary
            
            I hope you're doing well! Based on your recent health records, there are a few key observations I'd like to share with you, along with some lifestyle suggestions to help manage your health better.
            
            Key Observations
            Blood Pressure: Your blood pressure is at 160/100 mmHg, indicating that your hypertension needs closer monitoring. It seems medication might not have been fully consistent, so adjusting your approach could help.
            Weight Management: Your BMI is 27.8, which falls in the overweight category. This could negatively impact your blood pressure and cardiovascular health.
            Family History: With a family history of cardiovascular conditions, it’s important to pay extra attention as your risk may be higher in the long term.
            
            Areas for Improvement
            Managing hypertension can be greatly helped by adjusting your lifestyle. Regular exercise, a healthy diet, and monitoring your blood pressure can all contribute to better control. Stress and intense physical activity might be aggravating your symptoms, so it's best to avoid overexertion.
            
            Lifestyle Recommendations
            Regular Blood Pressure Monitoring: It's a good idea to check your blood pressure daily at home and communicate regularly with your doctor.
            Dietary Adjustments: Incorporating more vegetables, fruits, and whole grains while reducing salt intake can support cardiovascular health.
            Moderate Exercise: Aim for 30 minutes of light to moderate exercise, such as walking, most days of the week, but please consult your doctor to ensure it's safe.
            Stress Management: Consider relaxation techniques like meditation, yoga, or deep breathing exercises to help manage daily stress, which will also benefit your overall health.
            
            With these small adjustments, you can make gradual improvements to your well-being. If you have any questions or need further support, feel free to reach out! Together, we can work toward maintaining your health.
        ```
        
        """, recentRecords);

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

    return response;
}
}

