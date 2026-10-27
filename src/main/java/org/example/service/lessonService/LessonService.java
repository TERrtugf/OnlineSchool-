package org.example.service.lessonService;

import org.example.domain.course.Course;
import org.example.domain.lesson.Lesson;
import org.example.repository.courseRepository.CourseRepository;
import org.example.repository.lessonRepository.LessonRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class LessonService {

    private final LessonRepository lessonRepository;
    private final CourseRepository courseRepository;

    public LessonService(
            LessonRepository lessonRepository,
            CourseRepository courseRepository) {
        this.lessonRepository = lessonRepository;
        this.courseRepository = courseRepository;
    }

    @Transactional
    public Lesson createLesson(Long courseId, Lesson lesson) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Курс не найден"));

        lesson.setId(null);
        lesson.setCourse(course);

        return lessonRepository.save(lesson);
    }

    @Transactional(readOnly = true)
    public List<Lesson> getLessonsByCourse(Long courseId) {
        if (!courseRepository.existsById(courseId)) {
            throw new IllegalArgumentException(
                    "Курс не найден");
        }

        return lessonRepository
                .findByCourseIdOrderByPositionAsc(courseId);
    }

    @Transactional(readOnly = true)
    public Lesson getLessonById(Long id) {
        return lessonRepository.findById(id)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Урок не найден"));
    }

    @Transactional
    public Lesson updateLesson(
            Long id,
            String title,
            String content,
            Integer position) {

        Lesson lesson = getLessonById(id);

        lesson.setTitle(title);
        lesson.setContent(content);
        lesson.setPosition(position);

        return lessonRepository.save(lesson);
    }

    @Transactional
    public void deleteLesson(Long id) {
        Lesson lesson = getLessonById(id);
        lessonRepository.delete(lesson);
    }
}
