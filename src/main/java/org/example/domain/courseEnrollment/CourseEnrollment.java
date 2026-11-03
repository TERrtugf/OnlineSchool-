package org.example.domain.courseEnrollment;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.example.domain.course.Course;
import org.example.domain.user.User;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "course_enrollments",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_enrollment_user_course",
                        columnNames = {"user_id", "course_id"}
                )
        }
)
@Getter
@Setter
@NoArgsConstructor
public class CourseEnrollment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "course_id", nullable = false)
    private Course course;

    @Column(nullable = false)
    private LocalDateTime enrolledAt;

    @PrePersist
    public void prePersist() {
        if (enrolledAt == null) {
            enrolledAt = LocalDateTime.now();
        }
    }
}
