package org.example.repository.courseEnrollmentRepository;

import org.example.domain.courseEnrollment.CourseEnrollment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CourseEnrollmentRepository
        extends JpaRepository<CourseEnrollment, Long> {

    boolean existsByUserIdAndCourseId(Long userId, Long courseId);

    List<CourseEnrollment> findByUserId(Long userId);

    Optional<CourseEnrollment> findByUserIdAndCourseId(
            Long userId,
            Long courseId
    );

    void deleteByCourseId(Long courseId);

    void deleteByUserIdAndCourseId(Long userId, Long courseId);
}