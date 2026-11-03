package org.example.controller;

import org.example.domain.lesson.Lesson;
import org.example.service.lessonService.LessonService;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.server.ResponseStatusException;

@Controller
@RequestMapping("/lessons")
public class LessonController {

    private final LessonService lessonService;

    public LessonController(LessonService lessonService) {
        this.lessonService = lessonService;
    }

    @GetMapping("/{id}")
    public String getLesson(
            @PathVariable Long id,
            Model model,
            @AuthenticationPrincipal UserDetails userDetails) {

        String username = userDetails != null
                ? userDetails.getUsername()
                : null;

        Lesson lesson = lessonService.getLessonByIdForUser(
                id,
                username
        );

        model.addAttribute("lesson", lesson);

        return "lesson-details";
    }
}
