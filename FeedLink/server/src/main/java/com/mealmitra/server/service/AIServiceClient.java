package com.mealmitra.server.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

@Service
@Slf4j
public class AIServiceClient {

    @Autowired
    private RestTemplate restTemplate;

    @Value("${app.ai-service.url}")
    private String aiServiceUrl;

    public Map<String, Object> orchestrateDonation(Map<String, Object> donationData) {
        try {
            String url = aiServiceUrl + "/ai/orchestrate/donation";

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(donationData, headers);

            log.info("Calling AI service at: {}", url);
            Map<String, Object> response = restTemplate.postForObject(url, request, Map.class);

            return response != null ? response : new HashMap<>();

        } catch (Exception e) {
            log.error("AI Service error: {}", e.getMessage(), e);

            // Return error response
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", true);
            errorResponse.put("success", false);
            errorResponse.put("message", "AI Service unavailable: " + e.getMessage());
            return errorResponse;
        }
    }
}
