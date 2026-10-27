package org.example.service.progressService;

import org.example.domain.lesson.Lesson;
import org.example.domain.progress.Progress;
import org.example.domain.progress.ProgressStatus;
import org.example.domain.user.User;

import org.example.repository.lessonRepository.LessonRepository;
import org.example.repository.progressRepository.ProgressRepository;
import org.example.repository.userRepository.UserRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ProgressService {

    private final ProgressRepository progressRepository;
    private final UserRepository userRepository;
    private final LessonRepository lessonRepository;

    public ProgressService(
            ProgressRepository progressRepository,
            UserRepository userRepository,
            LessonRepository lessonRepository) {
        this.progressRepository = progressRepository;
        this.userRepository = userRepository;
        this.lessonRepository = lessonRepository;
    }

    @Transactional(readOnly = true)
    public List<Progress> getUserProgress(Long userId) {
        if (!userRepository.existsById(userId)) {
            throw new IllegalArgumentException(
                    "Пользователь не найден");
        }

        return progressRepository.findByUserId(userId);
    }

    @Transactional
    public Progress startLesson(Long userId, Long lessonId) {
        Progress progress = progressRepository
                .findByUserIdAndLessonId(userId, lessonId)
                .orElse(null);

        if (progress != null) {
            if (progress.getStatus()
                    == ProgressStatus.NOT_STARTED) {
                progress.setStatus(
                        ProgressStatus.IN_PROGRESS);
            }

            return progressRepository.save(progress);
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Пользователь не найден"));

        Lesson lesson = lessonRepository.findById(lessonId)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Урок не найден"));

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
}
