package org.example.dto.task;

import org.example.domain.task.SubmissionStatus;

public record ReviewSubmissionRequest(
        SubmissionStatus status,
        Integer grade,
        String teacherComment
) {
}
