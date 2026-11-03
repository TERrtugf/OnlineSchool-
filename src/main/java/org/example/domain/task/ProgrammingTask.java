package org.example.domain.task;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.example.domain.lesson.Lesson;

import java.time.LocalDateTime;

@Entity
@Table(name = "programming_tasks")
@Getter
@Setter
@NoArgsConstructor
public class ProgrammingTask {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "lesson_id", nullable = false)
    private Lesson lesson;

    @Column(nullable = false, length = 150)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    @Column(columnDefinition = "TEXT")
    private String inputDescription;

    @Column(columnDefinition = "TEXT")
    private String outputDescription;

    @Column(columnDefinition = "TEXT")
    private String examples;

    @Column(nullable = false, length = 30)
    private String programmingLanguage = "Java";

    @Column(columnDefinition = "TEXT")
    private String starterCode;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}