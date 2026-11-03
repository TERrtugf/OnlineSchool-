package org.example.service.progressService;

import org.example.domain.course.Course;
import org.example.domain.lesson.Lesson;
import org.example.domain.progress.Progress;
import org.example.domain.progress.ProgressStatus;
import org.example.domain.user.User;

import org.example.dto.profile.StudentProfileResponse;

import org.example.repository.courseRepository.CourseRepository;
import org.example.repository.lessonRepository.LessonRepository;
import org.example.repository.progressRepository.ProgressRepository;
import org.example.repository.userRepository.UserRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class ProgressService {

    private final ProgressRepository progressRepository;
    private final UserRepository userRepository;
    private final LessonRepository lessonRepository;
    private final CourseRepository courseRepository;

    public ProgressService(
            ProgressRepository progressRepository,
            UserRepository userRepository,
            LessonRepository lessonRepository,
            CourseRepository courseRepository
    ) {
        this.progressRepository = progressRepository;
        this.userRepository = userRepository;
        this.lessonRepository = lessonRepository;
        this.courseRepository = courseRepository;
    }

    @Transactional(readOnly = true)
    public List<Progress> getUserProgress(Long userId) {

        if (!userRepository.existsById(userId)) {
            throw new IllegalArgumentException(
                    "Пользователь не найден"
            );
        }

        return progressRepository.findByUserId(userId);
    }

    @Transactional
    public Progress startLesson(Long userId, Long lessonId) {

        Progress progress = progressRepository
                .findByUserIdAndLessonId(userId, lessonId)
                .orElse(null);

        if (progress != null) {
            progress.setStatus(ProgressStatus.IN_PROGRESS);
            return progressRepository.save(progress);
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Пользователь не найден"
                        )
                );

        Lesson lesson = lessonRepository.findById(lessonId)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Урок не найден"
                        )
                );

        progress = new Progress();
        progress.setUser(user);
        progress.setLesson(lesson);
        progress.setStatus(ProgressStatus.IN_PROGRESS);

        return progressRepository.save(progress);
    }

    @Transactional
    public Progress completeLesson(Long userId, Long lessonId) {

        Progress progress = progressRepository
                .findByUserIdAndLessonId(userId, lessonId)
                .orElseGet(() -> startLesson(userId, lessonId));

        progress.setStatus(ProgressStatus.COMPLETED);

        return progressRepository.save(progress);
    }

    @Transactional(readOnly = true)
    public StudentProfileResponse getStudentProfile(Long userId) {

        User user = userRepository.findById(userId)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Пользователь не найден"
                        )
                );

        List<Progress> userProgress =
                progressRepository.findByUserId(userId);

        Set<Long> completedLessonIds = userProgress.stream()
                .filter(progress ->
                        progress.getStatus() == ProgressStatus.COMPLETED
                )
                .map(progress ->
                        progress.getLesson().getId()
                )
                .collect(Collectors.toSet());

        List<Course> allCourses = courseRepository.findAll();

        long totalLessons = 0;
        long completedLessons = 0;

        List<StudentProfileResponse.CourseProgress> courses =
                new ArrayList<>();

        for (Course course : allCourses) {

            List<Lesson> lessons =
                    lessonRepository.findByCourseIdOrderByPositionAsc(
                            course.getId()
                    );

            long courseTotal = lessons.size();

            long courseCompleted = lessons.stream()
                    .filter(lesson ->
                            completedLessonIds.contains(lesson.getId())
                    )
                    .count();

            int coursePercent = courseTotal == 0
                    ? 0
                    : (int) (courseCompleted * 100 / courseTotal);

            totalLessons += courseTotal;
            completedLessons += courseCompleted;

            courses.add(
                    new StudentProfileResponse.CourseProgress(
                            course.getId(),
                            course.getTitle(),
                            courseTotal,
                            courseCompleted,
                            coursePercent
                    )
            );
        }

        int overallPercent = totalLessons == 0
                ? 0
                : (int) (completedLessons * 100 / totalLessons);

        return new StudentProfileResponse(
                user.getUsername(),
                allCourses.size(),
                totalLessons,
                completedLessons,
                overallPercent,
                courses
        );
    }
}
