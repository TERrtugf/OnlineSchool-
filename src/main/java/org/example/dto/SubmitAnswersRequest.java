package org.example.dto;

import java.util.Map;

public record SubmitAnswersRequest(
        Map<Long, Long> answers
) {
}
