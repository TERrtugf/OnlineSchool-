package org.example.controller;

import org.example.domain.progress.Progress;
import org.example.domain.progress.ProgressStatus;

import org.example.dto.profile.StudentProfileResponse;
import org.example.service.progressService.ProgressService;

import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/progress")
public class ProgressController {

    private final ProgressService progressService;

    public ProgressController(ProgressService progressService) {
        this.progressService = progressService;
    }

    @GetMapping("/{userId}")
    public List<ProgressResponse> getUserProgress(
            @PathVariable Long userId
    ) {
        return progressService.getUserProgress(userId)
                .stream()
                .map(ProgressResponse::from)
                .toList();
    }

    @PostMapping("/{userId}/lessons/{lessonId}/start")
    public ProgressResponse startLesson(
            @PathVariable Long userId,
            @PathVariable Long lessonId
    ) {
        return ProgressResponse.from(
                progressService.startLesson(userId, lessonId)
        );
    }

    @PostMapping("/{userId}/lessons/{lessonId}/complete")
    public ProgressResponse completeLesson(
            @PathVariable Long userId,
            @PathVariable Long lessonId
    ) {
        return ProgressResponse.from(
                progressService.completeLesson(userId, lessonId)
        );
    }

    @GetMapping("/{userId}/profile")
    public StudentProfileResponse getStudentProfile(
            @PathVariable Long userId
    ) {
        return progressService.getStudentProfile(userId);
    }

    public record ProgressResponse(
            Long id,
            Long userId,
            Long lessonId,
            ProgressStatus status
    ) {

        public static ProgressResponse from(Progress progress) {
            return new ProgressResponse(
                    progress.getId(),
                    progress.getUser().getId(),
                    progress.getLesson().getId(),
                    progress.getStatus()
            );
        }
    }
}
