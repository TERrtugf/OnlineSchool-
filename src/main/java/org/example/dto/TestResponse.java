package org.example.dto;

import java.util.List;

public record TestResponse(
        Long id,
        String title,
        String description,
        List<QuestionResponse> questions
) {
    public record QuestionResponse(
            Long id,
            String text,
            List<AnswerOptionResponse> answerOptions
    ) {
    }

    public record AnswerOptionResponse(
            Long id,
            String text
    ) {
    }
}
