package org.example.dto.task;

public record TaskResponse(
        Long id,
        Long lessonId,
        String title,
        String description,
        String inputDescription,
        String outputDescription,
        String examples,
        String programmingLanguage,
        String starterCode
) {
}
