package com.example.demo;

import org.springframework.ai.embedding.EmbeddingModel;
import org.springframework.ai.openai.OpenAiEmbeddingModel;
import org.springframework.ai.openai.api.OpenAiApi;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.data.elasticsearch.repository.config.EnableElasticsearchRepositories;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.web.client.RestClient;

@SpringBootApplication
@EnableElasticsearchRepositories
@EnableJpaRepositories
public class DemoApplication {

	public static void main(String[] args) {
		SpringApplication.run(DemoApplication.class, args);
	}
	@Bean
	public ObjectMapper objectMapper() {
		ObjectMapper objectMapper = new ObjectMapper();
		// Register JavaTimeModule to support the new Date and Time API in Java 8+
		objectMapper.registerModule(new JavaTimeModule());
		objectMapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
		objectMapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
		return objectMapper;
	}

	@Value("${spring.ai.openai.api-key}")
	private String openAiApiKey;


	@Bean
	public EmbeddingModel embeddingModel() {
		// Can be any other EmbeddingModel implementation.
		return new OpenAiEmbeddingModel(new OpenAiApi(openAiApiKey));
	}

//	@Bean
//	public RestClient.Builder restClientBuilder() {
//		return RestClient.builder()
//				.requestFactory(new SimpleClientHttpRequestFactory());
//	}
//
//	@Bean
//	public ChromaApi chromaApi(RestClient.Builder restClientBuilder) {
//		String chromaUrl = "http://chroma:8000";
//		ChromaApi chromaApi = new ChromaApi(chromaUrl, restClientBuilder);
//		chromaApi.withKeyToken("admin:admin");
//		return chromaApi;
//	}
//
//	@Bean
//	public VectorStore chromaVectorStore(EmbeddingModel embeddingModel, ChromaApi chromaApi) {
//		try {
//			// Create the "health-ai" collection
//			String collectionName = "health-ai";
//			ChromaApi.CreateCollectionRequest request = new ChromaApi.CreateCollectionRequest(collectionName);
//			ChromaApi.Collection collection = chromaApi.createCollection(request);
//			System.out.println("Collection created successfully: " + collection.name());
//
//			// Initialize ChromaVectorStore with the created collection
//			VectorStore store = new ChromaVectorStore(embeddingModel, chromaApi, collectionName, true);
//			System.out.println("ChromaVectorStore initialized successfully");
//			return store;
//		} catch (Exception e) {
//			System.err.println("Error initializing ChromaVectorStore: " + e.getMessage());
//			e.printStackTrace();
//			throw e;
//		}
//	}

}
