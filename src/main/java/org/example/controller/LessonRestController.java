package org.example.controller;

import org.example.domain.lesson.Lesson;
import org.example.service.lessonService.LessonService;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
public class LessonRestController {

    private final LessonService lessonService;

    public LessonRestController(LessonService lessonService) {
        this.lessonService = lessonService;
    }

    @GetMapping("/api/courses/{courseId}/lessons")
    public List<LessonResponse> getLessonsByCourse(
            @PathVariable Long courseId,
            @AuthenticationPrincipal UserDetails userDetails) {

        String username = userDetails != null
                ? userDetails.getUsername()
                : null;

        boolean canAccessContent =
                lessonService.canAccessCourseContent(
                        courseId,
                        username
                );

        return lessonService.getLessonsByCourse(courseId)
                .stream()
                .map(lesson -> LessonResponse.from(
                        lesson,
                        canAccessContent
                ))
                .toList();
    }

    @GetMapping("/api/lessons/{id}")
    public LessonResponse getLesson(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {

        String username = userDetails != null
                ? userDetails.getUsername()
                : null;

        Lesson lesson = lessonService.getLessonByIdForUser(
                id,
                username
        );

        return LessonResponse.from(lesson, true);
    }

    @PostMapping("/api/courses/{courseId}/lessons")
    public LessonResponse createLesson(
            @PathVariable Long courseId,
            @RequestBody CreateLessonRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {

        Lesson lesson = new Lesson();
        lesson.setTitle(request.title());
        lesson.setContent(request.content());
        lesson.setPosition(request.position());

        Lesson saved = lessonService.createLesson(
                courseId,
                lesson,
                userDetails.getUsername()
        );

        return LessonResponse.from(saved, true);
    }

    @PutMapping("/api/lessons/{id}")
    public LessonResponse updateLesson(
            @PathVariable Long id,
            @RequestBody UpdateLessonRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {

        Lesson updated = lessonService.updateLesson(
                id,
                request.title(),
                request.content(),
                request.position(),
                userDetails.getUsername()
        );

        return LessonResponse.from(updated, true);
    }

    @DeleteMapping("/api/lessons/{id}")
    public void deleteLesson(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {

        lessonService.deleteLesson(
                id,
                userDetails.getUsername()
        );
    }

    public record CreateLessonRequest(
            String title,
            String content,
            Integer position
    ) {}

    public record UpdateLessonRequest(
            String title,
            String content,
            Integer position
    ) {}

    public record LessonResponse(
            Long id,
            Long courseId,
            String title,
            String content,
            Integer position
    ) {

        public static LessonResponse from(
                Lesson lesson,
                boolean includeContent) {

            return new LessonResponse(
                    lesson.getId(),
                    lesson.getCourse().getId(),
                    lesson.getTitle(),
                    includeContent ? lesson.getContent() : null,
                    lesson.getPosition()
            );
        }
    }
}
