
package org.example.dto.task;

import org.example.domain.task.SubmissionStatus;

import java.time.LocalDateTime;

public record SubmissionResponse(
        Long id,
        Long taskId,
        String taskTitle,
        Long lessonId,
        String lessonTitle,
        Long courseId,
        String courseTitle,
        String studentUsername,
        String submittedCode,
        SubmissionStatus status,
        Integer grade,
        String teacherComment,
        String reviewerUsername,
        LocalDateTime submittedAt,
        LocalDateTime reviewedAt
) {
}
