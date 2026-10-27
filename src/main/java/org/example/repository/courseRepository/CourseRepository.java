package org.example.repository.courseRepository;

import org.example.domain.course.Course;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CourseRepository
        extends JpaRepository<Course, Long> {

    List<Course> findByAuthorId(Long authorId);

    List<Course> findByTitleContainingIgnoreCase(
            String title
    );
}
