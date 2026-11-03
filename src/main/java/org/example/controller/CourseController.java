package org.example.controller;

import org.example.domain.course.Course;
import org.example.service.courseService.CourseService;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
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
        return CourseResponse.from(
                courseService.getCourseById(id)
        );
    }

    @GetMapping("/author/{authorId}")
    public List<CourseResponse> getCoursesByAuthor(
            @PathVariable Long authorId) {

        return courseService.getCoursesByAuthor(authorId)
                .stream()
                .map(CourseResponse::from)
                .toList();
    }

    @GetMapping("/my")
    public List<CourseResponse> getMyCourses(
            @AuthenticationPrincipal UserDetails userDetails) {

        return courseService.getMyCourses(userDetails.getUsername())
                .stream()
                .map(CourseResponse::from)
                .toList();
    }

    @GetMapping("/{id}/enrollment")
    public EnrollmentResponse checkEnrollment(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {

        boolean enrolled = courseService.isEnrolled(
                id,
                userDetails.getUsername()
        );

        return new EnrollmentResponse(enrolled);
    }

    @PostMapping("/{id}/enroll")
    public void enrollInCourse(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {

        courseService.enrollInCourse(
                id,
                userDetails.getUsername()
        );
    }

    @DeleteMapping("/{id}/enroll")
    public void unenrollFromCourse(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {

        courseService.unenrollFromCourse(
                id,
                userDetails.getUsername()
        );
    }

    @PostMapping
    public CourseResponse createCourse(
            @RequestBody CreateCourseRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {

        Course course = new Course();
        course.setTitle(request.title());
        course.setDescription(request.description());

        Course saved = courseService.createCourse(
                userDetails.getUsername(),
                course
        );

        return CourseResponse.from(saved);
    }

    @PutMapping("/{id}")
    public CourseResponse updateCourse(
            @PathVariable Long id,
            @RequestBody UpdateCourseRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {

        Course updated = courseService.updateCourse(
                id,
                request.title(),
                request.description(),
                userDetails.getUsername()
        );

        return CourseResponse.from(updated);
    }

    @DeleteMapping("/{id}")
    public void deleteCourse(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {

        courseService.deleteCourse(
                id,
                userDetails.getUsername()
        );
    }

    public record CreateCourseRequest(
            String title,
            String description
    ) {}

    public record UpdateCourseRequest(
            String title,
            String description
    ) {}

    public record CourseResponse(
            Long id,
            String title,
            String description,
            Long authorId
    ) {
        public static CourseResponse from(Course course) {
            return new CourseResponse(
                    course.getId(),
                    course.getTitle(),
                    course.getDescription(),
                    course.getAuthor().getId()
            );
        }
    }

    public record EnrollmentResponse(boolean enrolled) {}
}