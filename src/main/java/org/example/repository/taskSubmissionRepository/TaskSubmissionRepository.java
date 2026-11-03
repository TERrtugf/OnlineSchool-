package org.example.repository.taskSubmissionRepository;

import org.example.domain.task.TaskSubmission;
import org.example.domain.task.SubmissionStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface TaskSubmissionRepository extends JpaRepository<TaskSubmission, Long> {

    List<TaskSubmission> findByStudentIdOrderBySubmittedAtDesc(Long studentId);

    List<TaskSubmission> findByTaskIdAndStudentIdOrderBySubmittedAtDesc(
            Long taskId,
            Long studentId
    );

    List<TaskSubmission> findByStatusOrderBySubmittedAtAsc(
            SubmissionStatus status
    );

    List<TaskSubmission> findByTaskLessonCourseAuthorIdAndStatusOrderBySubmittedAtAsc(
            Long authorId,
            SubmissionStatus status
    );

    Optional<TaskSubmission> findByIdAndTaskLessonCourseAuthorId(
            Long submissionId,
            Long authorId
    );

    void deleteByTaskId(Long taskId);
}