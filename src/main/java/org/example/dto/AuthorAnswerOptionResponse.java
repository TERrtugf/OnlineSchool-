package org.example.dto;

public record AuthorAnswerOptionResponse(
        Long id,
        String text,
        boolean correct
) {
}