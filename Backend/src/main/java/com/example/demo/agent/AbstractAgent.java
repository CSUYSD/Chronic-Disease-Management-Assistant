package com.example.demo.agent;

import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.model.ChatModel;
import org.springframework.context.annotation.Description;
import org.springframework.util.StringUtils;

import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.function.Function;

@Slf4j
public abstract class AbstractAgent<Req, Resp> implements Function<Req, Resp> {
    private final ChatClient client;
    private final Map<String, String> functionNameMapping;

    protected AbstractAgent(ChatModel chatModel) {
        // 1. Initialize the function name mapping table
        this.functionNameMapping = new HashMap<>();
        this.client = ChatClient
                .builder(chatModel)
                .defaultFunctions(getFunctions())
                .build();
    }

    public ChatClient getChatClient() {
        return client;
    }

    /**
     * Get the embedded Function Call, which is the Agent's Tools
     *
     * @return List of Function Call names
     */
    private String[] getFunctions() {
        // 1. Find all inner classes annotated with the Description annotation
        List<Class<?>> classList = Arrays.stream(this.getClass().getClasses())
                .filter(aClass -> aClass.isAnnotationPresent(Description.class))
                .toList();

        // 2. Create the result array
        String[] names = new String[classList.size()];

        // 3. Convert class to function name and store the mapping
        return classList.stream()
                .map(aClass -> {
                    // Generate Spring Bean name
                    String beanName = StringUtils.uncapitalize(this.getClass().getSimpleName())
                            + "." + aClass.getSimpleName();

                    // Generate OpenAI function name
                    String functionName = StringUtils.uncapitalize(aClass.getSimpleName())
                            .replaceAll("([a-z])([A-Z])", "$1_$2")
                            .toLowerCase();

                    // Store the mapping relationship
                    functionNameMapping.put(functionName, beanName);

                    // Return OpenAI function name
                    return functionName;
                })
                .toArray(String[]::new);
    }

    /**
     * Process each function class, create a mapping, and return the OpenAI formatted function name
     */
    private String processFunctionClass(Class<?> functionClass) {
        // Spring Bean name (used in the Spring container)
        String beanName = this.getClass().getSimpleName() + "." + functionClass.getSimpleName();

        // OpenAI function name (used for API calls)
        String openAiFunctionName = generateOpenAiFunctionName(functionClass);

        // Store the mapping relationship
        functionNameMapping.put(openAiFunctionName, beanName);

        return openAiFunctionName;
    }

    /**
     * Generate an OpenAI-compliant function name
     */
    private String generateOpenAiFunctionName(Class<?> functionClass) {
        String baseName = StringUtils.uncapitalize(functionClass.getSimpleName());
        return baseName.replaceAll("([a-z])([A-Z])", "$1_$2").toLowerCase();
    }

    /**
     * Retrieve the Spring Bean name mapping
     */
    protected String getBeanNameForFunction(String openAiFunctionName) {
        return functionNameMapping.get(openAiFunctionName);
    }
}
