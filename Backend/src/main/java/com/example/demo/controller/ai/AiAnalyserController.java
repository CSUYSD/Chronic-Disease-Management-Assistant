package com.example.demo.controller.ai;

import com.example.demo.service.ai.AiAnalyserService;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/ai/analyser")
@Slf4j
@AllArgsConstructor
public class AiAnalyserController {
    @Autowired public final AiAnalyserService aiAnalyserService;



    @PostMapping("/health-report")
    public ResponseEntity<String> generateOverAllHealthReport(@RequestHeader("Authorization") String token) {
        log.info("Generating overall health report");
        return ResponseEntity.ok(aiAnalyserService.generateOverAllHealthReport(token));
    }


}
