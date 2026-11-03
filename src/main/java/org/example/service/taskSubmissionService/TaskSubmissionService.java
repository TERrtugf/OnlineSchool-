package org.example.service.taskSubmissionService;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.example.domain.task.ProgrammingTask;
import org.example.domain.task.SubmissionStatus;
import org.example.domain.task.TaskSubmission;
import org.example.domain.user.User;
import org.example.repository.courseEnrollmentRepository.CourseEnrollmentRepository;
import org.example.repository.programmingTaskRepository.ProgrammingTaskRepository;
import org.example.repository.taskSubmissionRepository.TaskSubmissionRepository;
import org.example.repository.userRepository.UserRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class TaskSubmissionService {

    private final TaskSubmissionRepository submissionRepository;
    private final ProgrammingTaskRepository taskRepository;
    private final UserRepository userRepository;
    private final CourseEnrollmentRepository enrollmentRepository;

    public TaskSubmission submitSolution(
            Long taskId,
            Long studentId,
            String submittedCode
    ) {
        ProgrammingTask task = taskRepository.findById(taskId)
                .orElseThrow(() ->
                        new IllegalArgumentException("Задание не найдено")
                );

        User student = userRepository.findById(studentId)
                .orElseThrow(() ->
                        new IllegalArgumentException("Пользователь не найден")
                );

        if (submittedCode == null || submittedCode.isBlank()) {
            throw new IllegalArgumentException(
                    "Необходимо написать решение"
            );
        }

        Long courseId = task.getLesson()
                .getCourse()
                .getId();

        if (!enrollmentRepository.existsByUserIdAndCourseId(
                studentId,
                courseId
        )) {
            throw new IllegalArgumentException(
                    "Сначала необходимо записаться на курс"
            );
        }

        if (task.getLesson().getCourse().getAuthor()
                .getId().equals(studentId)) {
            throw new IllegalArgumentException(
                    "Автор курса не может отправлять решение своего задания"
            );
        }

        TaskSubmission submission = new TaskSubmission();

        submission.setTask(task);
        submission.setStudent(student);
        submission.setSubmittedCode(submittedCode);
        submission.setStatus(SubmissionStatus.PENDING);

        return submissionRepository.save(submission);
    }

    @Transactional(Transactional.TxType.SUPPORTS)
    public List<TaskSubmission> getStudentSubmissions(Long studentId) {

        if (!userRepository.existsById(studentId)) {
            throw new IllegalArgumentException(
                    "Пользователь не найден"
            );
        }

        return submissionRepository
                .findByStudentIdOrderBySubmittedAtDesc(studentId);
    }

    @Transactional(Transactional.TxType.SUPPORTS)
    public List<TaskSubmission> getSubmissionsByTask(
            Long taskId,
            Long studentId
    ) {
        return submissionRepository
                .findByTaskIdAndStudentIdOrderBySubmittedAtDesc(
                        taskId,
                        studentId
                );
    }

    @Transactional(Transactional.TxType.SUPPORTS)
    public List<TaskSubmission> getPendingSubmissions(Long authorId) {

        return submissionRepository
                .findByTaskLessonCourseAuthorIdAndStatusOrderBySubmittedAtAsc(
                        authorId,
                        SubmissionStatus.PENDING
                );
    }

    public TaskSubmission reviewSubmission(
            Long submissionId,
            Long authorId,
            SubmissionStatus status,
            Integer grade,
            String teacherComment
    ) {
        TaskSubmission submission = submissionRepository
                .findByIdAndTaskLessonCourseAuthorId(
                        submissionId,
                        authorId
                )
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Решение не найдено или у тебя нет прав на его проверку"
                        )
                );

        if (submission.getStatus() != SubmissionStatus.PENDING) {
            throw new IllegalArgumentException(
                    "Это решение уже проверено"
            );
        }

        if (status != SubmissionStatus.APPROVED
                && status != SubmissionStatus.REJECTED) {
            throw new IllegalArgumentException(
                    "Необходимо выбрать результат проверки"
            );
        }

        if (grade == null || grade < 0 || grade > 100) {
            throw new IllegalArgumentException(
                    "Оценка должна быть от 0 до 100"
            );
        }

        User reviewer = userRepository.findById(authorId)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Проверяющий пользователь не найден"
                        )
                );

        submission.setStatus(status);
        submission.setGrade(grade);
        submission.setTeacherComment(teacherComment);
        submission.setReviewer(reviewer);
        submission.setReviewedAt(LocalDateTime.now());

        return submissionRepository.save(submission);
    }
}
