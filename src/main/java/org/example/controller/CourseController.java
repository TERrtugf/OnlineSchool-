package org.example.controller;

import org.example.domain.course.Course;
import org.example.service.courseService.CourseService;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;

import java.util.List;

@Controller
@RequestMapping("/courses")
public class CourseController {

    private final CourseService courseService;

    public CourseController(CourseService courseService) {
        this.courseService = courseService;
    }

    // Страница со всеми курсами
    @GetMapping
    public String getAllCourses(Model model) {
        List<Course> courses = courseService.getAllCourses();

        model.addAttribute("courses", courses);

        return "courses";
    }

    // Страница одного курса
    @GetMapping("/{id}")
    public String getCourseById(
            @PathVariable Long id,
            Model model) {

        Course course = courseService.getCourseById(id);

        model.addAttribute("course", course);

        return "course-details";
    }
}
