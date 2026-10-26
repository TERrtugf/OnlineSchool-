package org.example.domain.progress;


import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.example.domain.lesson.Lesson;
import org.example.domain.user.User;

@Entity
@Table(
        name = "progress",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_progress_user_lesson",
                        columnNames = {"user_id", "lesson_id"}
                )
        }
)
@Getter
@Setter
@NoArgsConstructor
public class Progress {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "lesson_id", nullable = false)
    private Lesson lesson;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ProgressStatus status = ProgressStatus.NOT_STARTED;
}
