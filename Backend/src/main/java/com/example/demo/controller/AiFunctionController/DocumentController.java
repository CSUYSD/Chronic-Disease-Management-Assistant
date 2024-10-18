package com.example.demo.controller.AiFunctionController;

import lombok.AllArgsConstructor;
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
import org.springframework.ai.openai.OpenAiEmbeddingModel;
import org.springframework.ai.reader.tika.TikaDocumentReader;
import org.springframework.ai.transformer.splitter.TokenTextSplitter;
import org.springframework.ai.vectorstore.ChromaVectorStore;
import org.springframework.ai.vectorstore.SearchRequest;
import org.springframework.ai.vectorstore.VectorStore;
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
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/ai/document")
@Slf4j
public class DocumentController {
    private final OpenAiEmbeddingModel openAiEmbeddingModel;
    @Autowired
    VectorStore vectorStore;
    @Autowired
    ChromaVectorStore chromaVectorStore;
    private final OpenAiChatModel openAiChatModel;
    private final ChatMemory chatMemory = new InMemoryChatMemory();
    private final Map<String, List<String>> fileDocumentIdsMap = new HashMap<>();

    private String currentConversationId = "";

    public DocumentController(OpenAiEmbeddingModel openAiEmbeddingModel, OpenAiChatModel openAiChatModel) {
        this.openAiEmbeddingModel = openAiEmbeddingModel;
        this.openAiChatModel = openAiChatModel;
    }

    @SneakyThrows
    @PostMapping("etl/read/local")
    public String readForLocal(@RequestParam String path) {
        Resource resource = new FileSystemResource(path);
        TikaDocumentReader reader = new TikaDocumentReader(resource);
        return reader
                .read()
                .get(0)
                .getContent();
    }

    @SneakyThrows
    @PostMapping("etl/read/multipart")
    public void saveVectorDB(@RequestParam MultipartFile file) {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("Uploaded file is empty");
        }
        Resource resource = new InputStreamResource(file.getInputStream());
        TikaDocumentReader reader = new TikaDocumentReader(resource);
        List<Document> splitDocuments = new TokenTextSplitter().apply(reader.read());

        String fileName = file.getOriginalFilename();
        List<String> documentIds = new ArrayList<>();

        for (Document doc : splitDocuments) {
            documentIds.add(doc.getId());
            System.out.printf("Document id: %s\n", doc.getId());
        }
        // 保存文件名和对应的文档ID列表
        fileDocumentIdsMap.put(fileName, documentIds);

        chromaVectorStore.doAdd(splitDocuments);
    }

    @SneakyThrows
    @GetMapping(value = "chat/stream/database", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public Flux<ServerSentEvent<String>> chatStreamWithDatabase(@RequestParam String prompt, @RequestParam String conversationId) {
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
                .advisors(new QuestionAnswerAdvisor(vectorStore, SearchRequest.defaults(), promptWithContext))
                .advisors(new MessageChatMemoryAdvisor(chatMemory, conversationId, 10))
                .stream()
                // 3. query发送给大模型得到答案
                .content()
                .map(chatResponse -> ServerSentEvent.builder(chatResponse)
                        .event("message")
                        .build());
    }

    //根据文件名进行单个文件的删除
    @DeleteMapping("etl/delete/{fileName}")
    public ResponseEntity<String> deleteFileFromVectorDB(@PathVariable String fileName) {
        List<String> documentIds = fileDocumentIdsMap.get(fileName);
        if (documentIds == null || documentIds.isEmpty()) {
            return ResponseEntity.badRequest().body("File not found or already deleted.");
        }

        try {
            System.out.printf("Deleting %d documents for file '%s' from vector database...\n", documentIds.size(), fileName);
            chromaVectorStore.doDelete(documentIds);
            fileDocumentIdsMap.remove(fileName);
            return ResponseEntity.ok("File '" + fileName + "' deleted successfully from vector database.");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to delete file '" + fileName + "' from vector database.");
        }
    }

    @GetMapping("etl/clear")
    public ResponseEntity<String> clearVectorDB() {
        try {
            List<String> allDocumentIds = fileDocumentIdsMap.values().stream()
                    .flatMap(List::stream)
                    .collect(Collectors.toList());

            System.out.printf("Deleting %d documents from vector database...\n", allDocumentIds.size());
            chromaVectorStore.doDelete(allDocumentIds);
            fileDocumentIdsMap.clear();
            return ResponseEntity.ok("Vector database cleared successfully.");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to clear vector database.");
        }
    }

    @PostMapping("embedding")
    public float[] embedding(@RequestParam String text) {
        return openAiEmbeddingModel.embed(text);
    }

    @RabbitListener(queues = "health.report.to.chatbot")
    public void receiveHealthReport(String report) {
        log.info("Chat bot received health report from AI analyser: {}", report);
        chatMemory.add(currentConversationId, new SystemMessage(report));
    }

}
