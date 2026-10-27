package org.example.repository.progressRepository;

import org.example.domain.progress.Progress;
import org.example.domain.progress.ProgressStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ProgressRepository
        extends JpaRepository<Progress, Long> {

    List<Progress> findByUserId(Long userId);

    Optional<Progress> findByUserIdAndLessonId(
            Long userId,
            Long lessonId
    );

    List<Progress> findByUserIdAndStatus(
            Long userId,
            ProgressStatus status
    );
}