
package org.example.controller;

import org.example.domain.course.Course;
import org.example.service.courseService.CourseService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/courses")
public class CourseController {

    private final CourseService courseService;

    public CourseController(CourseService courseService) {
        this.courseService = courseService;
    }

    @GetMapping
    public List<CourseResponse> getAllCourses() {
        return courseService.getAllCourses()
                .stream()
                .map(CourseResponse::from)
                .toList();
    }

    @GetMapping("/{id}")
    public CourseResponse getCourseById(@PathVariable Long id) {
        return CourseResponse.from(courseService.getCourseById(id));
    }

    @PostMapping
    public CourseResponse createCourse(
            @RequestBody CreateCourseRequest request) {

        Course course = new Course();
        course.setTitle(request.title());
        course.setDescription(request.description());

        Course saved = courseService.createCourse(
                request.authorId(), course);

        return CourseResponse.from(saved);
    }

    public record CreateCourseRequest(
            String title,
            String description,
            Long authorId
    ) {}

    public record CourseResponse(
            Long id,
            String title,
            String description
    ) {
        public static CourseResponse from(Course course) {
            return new CourseResponse(
                    course.getId(),
                    course.getTitle(),
                    course.getDescription()
            );
        }
    }
}
