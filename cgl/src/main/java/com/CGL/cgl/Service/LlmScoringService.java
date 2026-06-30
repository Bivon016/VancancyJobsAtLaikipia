package com.CGL.cgl.Service;

import com.CGL.cgl.DTO.LlmScoreResult;
import com.CGL.cgl.Model.InterviewQuestion;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;

@Service
public class LlmScoringService {

    private final HttpClient httpClient;
    private final ObjectMapper objectMapper;

    @Value("${groq.api.key}")
    private String apiKey;

    private static final String API_URL = "https://api.groq.com/openai/v1/chat/completions";
    // Pick a currently-supported Groq model — check console.groq.com/docs/models
    // for the latest available model IDs, as Groq deprecates models periodically.
    private static final String MODEL = "llama-3.3-70b-versatile";

    public LlmScoringService() {
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(10))
                .build();
        this.objectMapper = new ObjectMapper();
    }

    public LlmScoreResult scoreAnswer(InterviewQuestion question, String answerText) {
        int maxScore = question.getMaxScore() != null ? question.getMaxScore() : 100;

        String prompt = buildPrompt(question, answerText, maxScore);

        try {
            String requestBody = buildRequestBody(prompt);

            HttpRequest httpRequest = HttpRequest.newBuilder()
                    .uri(URI.create(API_URL))
                    .header("Content-Type", "application/json")
                    .header("Authorization", "Bearer " + apiKey)
                    .timeout(Duration.ofSeconds(30))
                    .POST(HttpRequest.BodyPublishers.ofString(requestBody))
                    .build();

            HttpResponse<String> response = httpClient.send(httpRequest, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() != 200) {
                throw new RuntimeException("Groq API returned status " + response.statusCode() + ": " + response.body());
            }

            return parseResponse(response.body(), maxScore);

        } catch (Exception e) {
            throw new RuntimeException("LLM scoring failed: " + e.getMessage(), e);
        }
    }

    private String buildPrompt(InterviewQuestion question, String answerText, int maxScore) {
        String modelAnswer = question.getModelAnswer() != null ? question.getModelAnswer() : "Not provided";
        String rubric = question.getMarkingRubric() != null ? question.getMarkingRubric() : "Use general judgement of correctness and completeness.";
        String questionType = question.getQuestionType() != null ? question.getQuestionType().name() : "ESSAY";
        String options = question.getOptionsJson() != null ? question.getOptionsJson() : "";
        String correctAnswer = question.getCorrectAnswer() != null ? question.getCorrectAnswer() : "Not provided";

        StringBuilder prompt = new StringBuilder();
        prompt.append("You are grading an interview answer. Score strictly according to the rubric and model answer provided.\n\n");
        prompt.append("Question type: ").append(questionType).append("\n\n");
        prompt.append("Question: ").append(question.getInterview_question()).append("\n\n");

        if (!options.isBlank()) {
            prompt.append("Choices: ").append(options).append("\n\n");
        }

        prompt.append("Model answer: ").append(modelAnswer).append("\n\n");
        prompt.append("Correct answer: ").append(correctAnswer).append("\n\n");
        prompt.append("Marking rubric: ").append(rubric).append("\n\n");
        prompt.append("Maximum score: ").append(maxScore).append("\n\n");
        prompt.append("Candidate's answer: ").append(answerText).append("\n\n");
        prompt.append("Respond with ONLY a JSON object, no preamble, no markdown formatting, in exactly this shape:\n");
        prompt.append("{\"score\": <integer between 0 and ").append(maxScore).append(">, \"feedback\": \"<short feedback, 2-3 sentences>\"}");

        return prompt.toString();
    }

    private String buildRequestBody(String prompt) throws Exception {
        var root = objectMapper.createObjectNode();
        root.put("model", MODEL);
        root.put("max_tokens", 500);
        root.put("temperature", 0.2); // low temperature for consistent grading
        root.put("response_format_placeholder", ""); // removed below, kept structure clear

        var messages = objectMapper.createArrayNode();
        var userMessage = objectMapper.createObjectNode();
        userMessage.put("role", "user");
        userMessage.put("content", prompt);
        messages.add(userMessage);

        root.set("messages", messages);
        root.remove("response_format_placeholder");

        // Groq supports forcing JSON output mode for compatible models
        var responseFormat = objectMapper.createObjectNode();
        responseFormat.put("type", "json_object");
        root.set("response_format", responseFormat);

        return objectMapper.writeValueAsString(root);
    }

    private LlmScoreResult parseResponse(String responseBody, int maxScore) throws Exception {
        JsonNode root = objectMapper.readTree(responseBody);
        JsonNode choices = root.path("choices");

        if (!choices.isArray() || choices.isEmpty()) {
            throw new RuntimeException("Unexpected Groq response shape: no choices");
        }

        String rawText = choices.get(0).path("message").path("content").asText();

        String cleaned = rawText.replaceAll("```json", "").replaceAll("```", "").trim();

        JsonNode parsed = objectMapper.readTree(cleaned);

        int score = parsed.path("score").asInt(0);
        String feedback = parsed.path("feedback").asText("No feedback provided");

        score = Math.max(0, Math.min(score, maxScore));

        return new LlmScoreResult(score, feedback);
    }
}