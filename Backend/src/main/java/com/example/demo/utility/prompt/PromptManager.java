package com.example.demo.utility.prompt;

import org.springframework.stereotype.Component;

@Component
public class PromptManager {

    private static final String RAG_CONTEXT_TEMPLATE = """
    Below is the context information (user's medical history):
    ---------------------
    {question_answer_context}
    ---------------------
    """;

    private static final String HEALTH_REPORT_TEMPLATE = """
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
    ```
        # Hello, John Doe! Here's your health summary
        
        I hope you're doing well! Based on your recent health records, there are a few key observations I'd like to share with you, along with some lifestyle suggestions to help manage your health better.
        
        ## Key Observations
        
        - **Blood Pressure**: Your blood pressure is at 160/100 mmHg, indicating that your hypertension needs closer monitoring. It seems medication might not have been fully consistent, so adjusting your approach could help.
        - **Weight Management**: Your BMI is 27.8, which falls in the overweight category. This could negatively impact your blood pressure and cardiovascular health.
        - **Family History**: With a family history of cardiovascular conditions, it's important to pay extra attention as your risk may be higher in the long term.
        
        ## Areas for Improvement
        
        Managing hypertension can be greatly helped by adjusting your lifestyle. Regular exercise, a healthy diet, and monitoring your blood pressure can all contribute to better control. Stress and intense physical activity might be aggravating your symptoms, so it's best to avoid overexertion.
        
        ## Lifestyle Recommendations
        
        - **Regular Blood Pressure Monitoring**: It's a good idea to check your blood pressure daily at home and communicate regularly with your doctor.
        - **Dietary Adjustments**: Incorporating more vegetables, fruits, and whole grains while reducing salt intake can support cardiovascular health.
        - **Moderate Exercise**: Aim for 30 minutes of light to moderate exercise, such as walking, most days of the week, but please consult your doctor to ensure it's safe.
        - **Stress Management**: Consider relaxation techniques like meditation, yoga, or deep breathing exercises to help manage daily stress, which will also benefit your overall health.
        
        With these small adjustments, you can make gradual improvements to your well-being. If you have any questions or need further support, feel free to reach out! Together, we can work toward maintaining your health.
    ```
    """;

    public String getHealthReportContext() {
        return RAG_CONTEXT_TEMPLATE;
    }

    public String getHealthReportPrompt(String recentRecords) {
        return String.format(HEALTH_REPORT_TEMPLATE, recentRecords);
    }
}
