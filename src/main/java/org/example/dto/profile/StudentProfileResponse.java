package org.example.dto.profile;

import java.util.List;

public record StudentProfileResponse(
        String username,
        long totalCourses,
        long totalLessons,
        long completedLessons,
        int progressPercent,
        List<CourseProgress> courses
) {

    public record CourseProgress(
            Long courseId,
            String courseTitle,
            long totalLessons,
            long completedLessons,
            int progressPercent
    ) {
    }
}