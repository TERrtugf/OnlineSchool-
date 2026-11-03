package org.example.dto.task;

public record TaskRequest(
        String title,
        String description,
        String inputDescription,
        String outputDescription,
        String examples,
        String programmingLanguage,
        String starterCode
) {
}
