package org.example.repository.programmingTaskRepository;

import org.example.domain.task.ProgrammingTask;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProgrammingTaskRepository
        extends JpaRepository<ProgrammingTask, Long> {

    List<ProgrammingTask> findByLessonIdOrderByIdAsc(Long lessonId);

    void deleteByLesson_Course_Id(Long courseId);
}