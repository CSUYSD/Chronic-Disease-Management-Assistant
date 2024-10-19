package com.example.demo.controller.AiFunctionController;


import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import lombok.SneakyThrows;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.client.advisor.MessageChatMemoryAdvisor;
import org.springframework.ai.chat.memory.ChatMemory;
import org.springframework.ai.chat.memory.InMemoryChatMemory;
import org.springframework.ai.chat.model.ChatResponse;
import org.springframework.ai.document.Document;
import org.springframework.ai.openai.OpenAiChatModel;
import org.springframework.ai.reader.tika.TikaDocumentReader;
import org.springframework.ai.transformer.splitter.TokenTextSplitter;
import org.springframework.ai.vectorstore.ChromaVectorStore;
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
@RequestMapping("vector-db")
public class VectorDBController {
    private static final ObjectMapper objectMapper = new ObjectMapper().registerModule(new JavaTimeModule());

    private final List<String> savedDocumentIds = new ArrayList<>();
    private final ChromaVectorStore chromaVectorStore;

    @Autowired
    public VectorDBController(ChromaVectorStore chromaVectorStore) {
        this.chromaVectorStore = chromaVectorStore;
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
        // Save the document ids for other ops
        for (Document doc : splitDocuments) {
            savedDocumentIds.add(doc.getId());
            System.out.printf("Document id: %s\n", doc.getId());
        }
        chromaVectorStore.doAdd(splitDocuments);
    }

    @GetMapping("etl/clear")
    public ResponseEntity<String> clearVectorDB() {
        try {
            System.out.printf("Deleting %d documents from vector database...\n", savedDocumentIds.size());
            chromaVectorStore.doDelete(savedDocumentIds);
            savedDocumentIds.clear();
            return ResponseEntity.ok("Vector database cleared successfully.");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to clear vector database.");
        }
    }

    @SneakyThrows
    private String toJsonString(ChatResponse chatResponse) {
        return objectMapper.writeValueAsString(chatResponse);
    }
}