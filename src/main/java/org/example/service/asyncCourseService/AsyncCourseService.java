package org.example.service.asyncCourseService;

import org.example.domain.course.Course;
import org.example.service.courseService.CourseService;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.concurrent.Callable;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

@Service
public class AsyncCourseService {

    private final CourseService courseService;

    private final ExecutorService executor =
            Executors.newFixedThreadPool(3);

    public AsyncCourseService(CourseService courseService) {
        this.courseService = courseService;
    }

    public List<String> processCourses() {
        List<Course> courses = courseService.getAllCourses();

        List<Callable<String>> tasks = courses.stream()
                .<Callable<String>>map(course -> () -> {
                    String threadName =
                            Thread.currentThread().getName();

                    return "Курс: " + course.getTitle()
                            + " | Поток: " + threadName;
                })
                .toList();

        try {
            return executor.invokeAll(tasks).stream()
                    .map(future -> {
                        try {
                            return future.get();
                        } catch (Exception e) {
                            throw new RuntimeException(
                                    "Ошибка обработки курса", e);
                        }
                    })
                    .toList();
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new RuntimeException(
                    "Обработка курсов прервана", e);
        }
    }
}
