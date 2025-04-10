package com.example.demo.controller.ai;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import lombok.SneakyThrows;
import org.springframework.ai.chat.model.ChatResponse;
import org.springframework.ai.document.Document;
import org.springframework.ai.reader.tika.TikaDocumentReader;
import org.springframework.ai.transformer.splitter.TokenTextSplitter;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.InputStreamResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("vector-db")
public class VectorDBController {
    private static final ObjectMapper objectMapper = new ObjectMapper().registerModule(new JavaTimeModule());

    private final Map<String, List<String>> fileDocumentIdsMap = new HashMap<>();
    private final VectorStore vectorStore;

    @Autowired
    public VectorDBController(VectorStore vectorStore) {
        this.vectorStore = vectorStore;
    }

    @SneakyThrows
    @PostMapping("etl/read/local")
    public String readForLocal(@RequestParam String path) {
        Resource resource = new FileSystemResource(path);
        TikaDocumentReader reader = new TikaDocumentReader(resource);
        return reader.read().get(0).getContent();
    }

    @SneakyThrows
    @PostMapping("etl/read/multipart")
    public ResponseEntity<String> saveVectorDB(@RequestParam MultipartFile file) {
        try {
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
            fileDocumentIdsMap.put(fileName, documentIds);

            System.out.println("Attempting to add documents to VectorStore");
            try {
                vectorStore.add(splitDocuments);
                System.out.println("Documents added successfully");
            } catch (Exception e) {
                System.err.println("Error adding documents to VectorStore: " + e.getMessage());
                e.printStackTrace();
                throw e;
            }
            return ResponseEntity.ok("File uploaded and processed successfully");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error processing file: " + e.getMessage());
        }
    }

    @DeleteMapping("etl/delete/{fileName}")
    public ResponseEntity<String> deleteFileFromVectorDB(@PathVariable String fileName) {
        List<String> documentIds = fileDocumentIdsMap.get(fileName);
        if (documentIds == null || documentIds.isEmpty()) {
            return ResponseEntity.badRequest().body("File not found or already deleted.");
        }

        try {
            System.out.printf("Deleting %d documents for file '%s' from vector database...\n", documentIds.size(), fileName);
            vectorStore.delete(documentIds);
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
            vectorStore.delete(allDocumentIds);
            fileDocumentIdsMap.clear();
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