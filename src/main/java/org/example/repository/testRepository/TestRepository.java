package org.example.repository.testRepository;

import org.example.domain.test.Test;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface TestRepository extends JpaRepository<Test, Long> {

    void deleteByLesson_Course_Id(Long courseId);

    boolean existsByLessonId(Long lessonId);

    @EntityGraph(attributePaths = "questions")
    Optional<Test> findByLessonId(Long lessonId);

    @EntityGraph(attributePaths = "questions")
    Optional<Test> findById(Long testId);
}