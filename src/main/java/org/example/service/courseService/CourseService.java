package org.example.service.courseService;

import org.example.domain.course.Course;
import org.example.domain.courseEnrollment.CourseEnrollment;
import org.example.domain.user.User;

import org.example.repository.courseRepository.CourseRepository;
import org.example.repository.userRepository.UserRepository;
import org.example.repository.progressRepository.ProgressRepository;
import org.example.repository.testRepository.TestRepository;
import org.example.repository.courseEnrollmentRepository.CourseEnrollmentRepository;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Objects;

@Service
public class CourseService {

    private final CourseRepository courseRepository;
    private final UserRepository userRepository;
    private final ProgressRepository progressRepository;
    private final TestRepository testRepository;
    private final CourseEnrollmentRepository enrollmentRepository;

    public CourseService(
            CourseRepository courseRepository,
            UserRepository userRepository,
            ProgressRepository progressRepository,
            TestRepository testRepository,
            CourseEnrollmentRepository enrollmentRepository) {

        this.courseRepository = courseRepository;
        this.userRepository = userRepository;
        this.progressRepository = progressRepository;
        this.testRepository = testRepository;
        this.enrollmentRepository = enrollmentRepository;
    }

    @Transactional
    public Course createCourse(String username, Course course) {

        User author = getUserByUsername(username);

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
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Курс не найден"
                ));
    }

    @Transactional(readOnly = true)
    public List<Course> getCoursesByAuthor(Long authorId) {
        return courseRepository.findByAuthorId(authorId);
    }

    @Transactional(readOnly = true)
    public List<Course> searchCourses(String title) {
        return courseRepository.findByTitleContainingIgnoreCase(title);
    }

    @Transactional
    public void enrollInCourse(Long courseId, String username) {

        User user = getUserByUsername(username);
        Course course = getCourseById(courseId);

        if (enrollmentRepository.existsByUserIdAndCourseId(
                user.getId(), courseId)) {

            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Вы уже записаны на этот курс"
            );
        }

        CourseEnrollment enrollment = new CourseEnrollment();
        enrollment.setUser(user);
        enrollment.setCourse(course);

        enrollmentRepository.save(enrollment);
    }

    @Transactional
    public void unenrollFromCourse(Long courseId, String username) {

        User user = getUserByUsername(username);

        getCourseById(courseId);

        if (!enrollmentRepository.existsByUserIdAndCourseId(
                user.getId(), courseId)) {

            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Вы не записаны на этот курс"
            );
        }

        progressRepository.deleteByUserIdAndLesson_Course_Id(
                user.getId(),
                courseId
        );

        enrollmentRepository.deleteByUserIdAndCourseId(
                user.getId(),
                courseId
        );
    }

    @Transactional(readOnly = true)
    public List<Course> getMyCourses(String username) {

        User user = getUserByUsername(username);

        return enrollmentRepository.findByUserId(user.getId())
                .stream()
                .map(CourseEnrollment::getCourse)
                .toList();
    }

    @Transactional(readOnly = true)
    public boolean isEnrolled(Long courseId, String username) {

        User user = getUserByUsername(username);
        getCourseById(courseId);

        return enrollmentRepository.existsByUserIdAndCourseId(
                user.getId(), courseId
        );
    }

    @Transactional
    public Course updateCourse(
            Long id,
            String title,
            String description,
            String username) {

        Course course = getCourseById(id);

        checkCourseOwner(course, username);

        course.setTitle(title);
        course.setDescription(description);

        return courseRepository.save(course);
    }

    @Transactional
    public void deleteCourse(Long id, String username) {

        Course course = getCourseById(id);

        checkCourseOwner(course, username);

        enrollmentRepository.deleteByCourseId(id);

        progressRepository.deleteByLesson_Course_Id(id);

        testRepository.deleteByLesson_Course_Id(id);

        courseRepository.delete(course);
    }

    private User getUserByUsername(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Пользователь не найден"
                ));
    }

    private void checkCourseOwner(Course course, String username) {

        User currentUser = getUserByUsername(username);

        if (!Objects.equals(
                course.getAuthor().getId(),
                currentUser.getId()
        )) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "У вас нет прав для управления этим курсом"
            );
        }
    }
}