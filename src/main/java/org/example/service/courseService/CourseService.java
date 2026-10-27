package org.example.service.courseService;

import org.example.domain.course.Course;
import org.example.domain.user.User;
import org.example.repository.courseRepository.CourseRepository;
import org.example.repository.userRepository.UserRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class CourseService {

    private final CourseRepository courseRepository;
    private final UserRepository userRepository;

    public CourseService(
            CourseRepository courseRepository,
            UserRepository userRepository) {
        this.courseRepository = courseRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public Course createCourse(Long authorId, Course course) {
        User author = userRepository.findById(authorId)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Автор не найден"));

        course.setId(null);
        course.setAuthor(author);

        return courseRepository.save(course);
    }

    @Transactional(readOnly = true)
    public List<Course> getAllCourses() {
        return courseRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Course getCourseById(Long id) {
        return courseRepository.findById(id)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Курс не найден"));
    }

    @Transactional(readOnly = true)
    public List<Course> getCoursesByAuthor(Long authorId) {
        return courseRepository.findByAuthorId(authorId);
    }

    @Transactional(readOnly = true)
    public List<Course> searchCourses(String title) {
        return courseRepository
                .findByTitleContainingIgnoreCase(title);
    }

    @Transactional
    public Course updateCourse(Long id, String title,
                               String description) {
        Course course = getCourseById(id);

        course.setTitle(title);
        course.setDescription(description);

        return courseRepository.save(course);
    }

    @Transactional
    public void deleteCourse(Long id) {
        Course course = getCourseById(id);
        courseRepository.delete(course);
    }
}