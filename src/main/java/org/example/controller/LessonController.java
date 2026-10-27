package org.example.controller;

import org.example.domain.lesson.Lesson;
import org.example.service.lessonService.LessonService;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;

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
            Model model) {

        Lesson lesson = lessonService.getLessonById(id);

        model.addAttribute("lesson", lesson);

        return "lesson-details";
    }
}
