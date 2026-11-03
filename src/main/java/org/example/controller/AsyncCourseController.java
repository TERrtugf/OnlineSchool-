package org.example.controller;

import org.example.service.asyncCourseService.AsyncCourseService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/async-courses")
public class AsyncCourseController {

    private final AsyncCourseService asyncCourseService;

    public AsyncCourseController(
            AsyncCourseService asyncCourseService) {
        this.asyncCourseService = asyncCourseService;
    }

    @GetMapping
    public List<String> processCourses() {
        return asyncCourseService.processCourses();
    }
}
