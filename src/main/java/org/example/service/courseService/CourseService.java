package org.example.service.courseService;

import org.example.domain.course.Course;
import org.example.domain.courseEnrollment.CourseEnrollment;
import org.example.domain.user.User;

import org.example.repository.courseRepository.CourseRepository;
import org.example.repository.userRepository.UserRepository;
import org.example.repository.progressRepository.ProgressRepository;
import org.example.repository.testRepository.TestRepository;
import org.example.repository.courseEnrollmentRepository.CourseEnrollmentRepository;
import org.example.repository.programmingTaskRepository.ProgrammingTaskRepository;
import org.example.repository.taskSubmissionRepository.TaskSubmissionRepository;
import org.example.repository.lessonRepository.LessonRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Objects;

@Service
public class CourseService {

    private final CourseRepository courseRepository;
    private final UserRepository userRepository;
    private final ProgressRepository progressRepository;
    private final TestRepository testRepository;
    private final CourseEnrollmentRepository enrollmentRepository;
    private final ProgrammingTaskRepository programmingTaskRepository;
    private final TaskSubmissionRepository taskSubmissionRepository;
    private final LessonRepository lessonRepository;

    public CourseService(
            CourseRepository courseRepository,
            UserRepository userRepository,
            ProgressRepository progressRepository,
            TestRepository testRepository,
            CourseEnrollmentRepository enrollmentRepository,
            ProgrammingTaskRepository programmingTaskRepository,
            TaskSubmissionRepository taskSubmissionRepository,
            LessonRepository lessonRepository
    ) {
        this.courseRepository = courseRepository;
        this.userRepository = userRepository;
        this.progressRepository = progressRepository;
        this.testRepository = testRepository;
        this.enrollmentRepository = enrollmentRepository;
        this.programmingTaskRepository = programmingTaskRepository;
        this.taskSubmissionRepository = taskSubmissionRepository;
        this.lessonRepository = lessonRepository;
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
                .orElseThrow(() -> new RuntimeException("Курс не найден"));
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
    public Course updateCourse(
            Long id,
            String title,
            String description,
            String username
    ) {
        Course course = getCourseById(id);
        checkCourseOwner(course, username);

        course.setTitle(title);
        course.setDescription(description);

        return courseRepository.save(course);
    }

    @Transactional
    public void enrollInCourse(Long courseId, String username) {
        Course course = getCourseById(courseId);
        User user = getUserByUsername(username);

        if (enrollmentRepository.existsByUserIdAndCourseId(user.getId(), courseId)) {
            throw new RuntimeException("Вы уже записаны на этот курс");
        }

        CourseEnrollment enrollment = new CourseEnrollment();
        enrollment.setUser(user);
        enrollment.setCourse(course);

        enrollmentRepository.save(enrollment);
    }

    @Transactional
    public void unenrollFromCourse(Long courseId, String username) {
        User user = getUserByUsername(username);

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

        return enrollmentRepository.existsByUserIdAndCourseId(
                user.getId(),
                courseId
        );
    }

    @Transactional
    public void deleteCourse(Long id, String username) {
        Course course = getCourseById(id);

        checkCourseOwner(course, username);

        taskSubmissionRepository.deleteByTask_Lesson_Course_Id(id);

        programmingTaskRepository.deleteByLesson_Course_Id(id);

        testRepository.deleteByLesson_Course_Id(id);

        progressRepository.deleteByLesson_Course_Id(id);

        enrollmentRepository.deleteByCourseId(id);

        lessonRepository.deleteByCourseId(id);

        courseRepository.delete(course);
    }

    private User getUserByUsername(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Пользователь не найден"));
    }

    private void checkCourseOwner(Course course, String username) {
        User currentUser = getUserByUsername(username);

        if (!Objects.equals(
                course.getAuthor().getId(),
                currentUser.getId()
        )) {
            throw new RuntimeException("У вас нет прав для изменения этого курса");
        }
    }
}