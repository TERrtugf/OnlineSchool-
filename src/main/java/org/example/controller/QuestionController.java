package org.example.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.example.service.questionService.QuestionService;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:5173")
public class QuestionController {

    private final QuestionService questionService;

    public QuestionController(QuestionService questionService) {
        this.questionService = questionService;
    }

    @PutMapping("/questions/{questionId}")
    public ResponseEntity<Void> updateQuestion(
            @PathVariable Long questionId,
            @RequestBody QuestionRequest request
    ) {
        questionService.updateQuestion(
                questionId,
                request.text()
        );

        return ResponseEntity.noContent().build();
    }

    @PutMapping("/answer-options/{optionId}")
    public ResponseEntity<Void> updateAnswerOption(
            @PathVariable Long optionId,
            @RequestBody AnswerOptionRequest request
    ) {
        questionService.updateAnswerOption(
                optionId,
                request.text(),
                request.correct()
        );

        return ResponseEntity.noContent().build();
    }

    public record QuestionRequest(String text) {
    }

    public record AnswerOptionRequest(String text, boolean correct) {
    }
}