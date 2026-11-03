package org.example.service.programmingTaskService;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

import org.example.domain.lesson.Lesson;
import org.example.domain.task.ProgrammingTask;
import org.example.repository.lessonRepository.LessonRepository;
import org.example.repository.programmingTaskRepository.ProgrammingTaskRepository;
import org.example.repository.taskSubmissionRepository.TaskSubmissionRepository;

import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class ProgrammingTaskService {

    private final ProgrammingTaskRepository taskRepository;
    private final LessonRepository lessonRepository;
    private final TaskSubmissionRepository submissionRepository;

    public ProgrammingTask createTask(
            Long lessonId,
            Long authorId,
            ProgrammingTask task
    ) {
        Lesson lesson = lessonRepository.findById(lessonId)
                .orElseThrow(() ->
                        new RuntimeException("Урок не найден")
                );

        checkCourseAuthor(lesson, authorId);

        validateTask(task);

        task.setLesson(lesson);

        return taskRepository.save(task);
    }

    @Transactional(Transactional.TxType.SUPPORTS)
    public List<ProgrammingTask> getTasksByLesson(Long lessonId) {

        if (!lessonRepository.existsById(lessonId)) {
            throw new RuntimeException("Урок не найден");
        }

        return taskRepository.findByLessonIdOrderByIdAsc(lessonId);
    }

    @Transactional(Transactional.TxType.SUPPORTS)
    public ProgrammingTask getTaskById(Long taskId) {

        return taskRepository.findById(taskId)
                .orElseThrow(() ->
                        new RuntimeException("Задание не найдено")
                );
    }

    public ProgrammingTask updateTask(
            Long taskId,
            Long authorId,
            ProgrammingTask updatedTask
    ) {
        ProgrammingTask existingTask = taskRepository.findById(taskId)
                .orElseThrow(() ->
                        new RuntimeException("Задание не найдено")
                );

        checkCourseAuthor(existingTask.getLesson(), authorId);

        validateTask(updatedTask);

        existingTask.setTitle(updatedTask.getTitle());
        existingTask.setDescription(updatedTask.getDescription());
        existingTask.setInputDescription(updatedTask.getInputDescription());
        existingTask.setOutputDescription(updatedTask.getOutputDescription());
        existingTask.setExamples(updatedTask.getExamples());
        existingTask.setProgrammingLanguage(updatedTask.getProgrammingLanguage());
        existingTask.setStarterCode(updatedTask.getStarterCode());

        return taskRepository.save(existingTask);
    }

    public void deleteTask(Long taskId, Long authorId) {

        ProgrammingTask task = taskRepository.findById(taskId)
                .orElseThrow(() ->
                        new RuntimeException("Задание не найдено")
                );

        checkCourseAuthor(task.getLesson(), authorId);

        submissionRepository.deleteByTaskId(taskId);

        taskRepository.delete(task);
    }

    private void checkCourseAuthor(Lesson lesson, Long authorId) {

        Long courseAuthorId = lesson.getCourse()
                .getAuthor()
                .getId();

        if (!courseAuthorId.equals(authorId)) {
            throw new RuntimeException(
                    "У вас нет прав на управление заданиями этого курса"
            );
        }
    }

    private void validateTask(ProgrammingTask task) {

        if (task.getTitle() == null || task.getTitle().isBlank()) {
            throw new RuntimeException(
                    "Название задания не может быть пустым"
            );
        }

        if (task.getTitle().length() > 150) {
            throw new RuntimeException(
                    "Название задания не должно превышать 150 символов"
            );
        }

        if (task.getDescription() == null || task.getDescription().isBlank()) {
            throw new RuntimeException(
                    "Описание задания не может быть пустым"
            );
        }

        if (task.getProgrammingLanguage() == null
                || task.getProgrammingLanguage().isBlank()) {
            throw new RuntimeException(
                    "Необходимо указать язык программирования"
            );
        }

        if (task.getProgrammingLanguage().length() > 30) {
            throw new RuntimeException(
                    "Название языка программирования не должно превышать 30 символов"
            );
        }
    }
}