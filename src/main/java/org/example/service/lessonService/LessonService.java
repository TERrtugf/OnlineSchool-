package org.example.service.lessonService;

import org.example.domain.course.Course;
import org.example.domain.lesson.Lesson;
import org.example.domain.user.User;
import org.example.repository.courseRepository.CourseRepository;
import org.example.repository.lessonRepository.LessonRepository;
import org.example.repository.userRepository.UserRepository;
import org.example.repository.courseEnrollmentRepository.CourseEnrollmentRepository;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Objects;

@Service
public class LessonService {

    private final LessonRepository lessonRepository;
    private final CourseRepository courseRepository;
    private final UserRepository userRepository;
    private final CourseEnrollmentRepository enrollmentRepository;

    public LessonService(
            LessonRepository lessonRepository,
            CourseRepository courseRepository,
            UserRepository userRepository,
            CourseEnrollmentRepository enrollmentRepository) {

        this.lessonRepository = lessonRepository;
        this.courseRepository = courseRepository;
        this.userRepository = userRepository;
        this.enrollmentRepository = enrollmentRepository;
    }

    @Transactional
    public Lesson createLesson(
            Long courseId,
            Lesson lesson,
            String username) {

        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Курс не найден"
                ));

        checkCourseOwner(course, username);

        lesson.setId(null);
        lesson.setCourse(course);

        return lessonRepository.save(lesson);
    }

    @Transactional(readOnly = true)
    public List<Lesson> getLessonsByCourse(Long courseId) {

        if (!courseRepository.existsById(courseId)) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Курс не найден"
            );
        }

        return lessonRepository
                .findByCourseIdOrderByPositionAsc(courseId);
    }

    @Transactional(readOnly = true)
    public Lesson getLessonById(Long id) {

        return lessonRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Урок не найден"
                ));
    }

    @Transactional(readOnly = true)
    public boolean canAccessCourseContent(
            Long courseId,
            String username) {

        if (username == null) {
            return false;
        }

        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Курс не найден"
                ));

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Пользователь не найден"
                ));

        if (Objects.equals(
                course.getAuthor().getId(),
                user.getId()
        )) {
            return true;
        }

        return enrollmentRepository.existsByUserIdAndCourseId(
                user.getId(),
                courseId
        );
    }

    @Transactional(readOnly = true)
    public Lesson getLessonByIdForUser(
            Long lessonId,
            String username) {

        Lesson lesson = getLessonById(lessonId);

        boolean hasAccess = canAccessCourseContent(
                lesson.getCourse().getId(),
                username
        );

        if (!hasAccess) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Сначала запишитесь на курс, чтобы начать урок"
            );
        }

        return lesson;
    }

    @Transactional
    public Lesson updateLesson(
            Long id,
            String title,
            String content,
            Integer position,
            String username) {

        Lesson lesson = getLessonById(id);

        checkCourseOwner(lesson.getCourse(), username);

        lesson.setTitle(title);
        lesson.setContent(content);
        lesson.setPosition(position);

        return lessonRepository.save(lesson);
    }

    @Transactional
    public void deleteLesson(Long id, String username) {

        Lesson lesson = getLessonById(id);

        checkCourseOwner(lesson.getCourse(), username);

        lessonRepository.delete(lesson);
    }

    private void checkCourseOwner(Course course, String username) {

        User currentUser = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Пользователь не найден"
                ));

        if (!Objects.equals(
                course.getAuthor().getId(),
                currentUser.getId()
        )) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "У вас нет прав для управления уроками этого курса"
            );
        }
    }
}
