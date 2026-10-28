
package org.example;

import org.example.domain.course.Course;
import org.example.domain.user.User;
import org.example.repository.courseRepository.CourseRepository;
import org.example.repository.userRepository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class DataInitializer {

    @Bean
    CommandLineRunner initDatabase(
            UserRepository userRepository,
            CourseRepository courseRepository) {

        return args -> {
            User author = userRepository
                    .findByUsername("teacher")
                    .orElseGet(() -> {
                        User user = new User();
                        user.setUsername("teacher");
                        user.setPassword("dev-password");
                        return userRepository.save(user);
                    });

            if (courseRepository.count() == 0) {
                Course course = new Course();

                course.setTitle("Основы Java");
                course.setDescription(
                        "Изучи переменные, условия, циклы " +
                                "и основы объектно-ориентированного программирования."
                );
                course.setAuthor(author);

                courseRepository.save(course);

                System.out.println(
                        "Первый курс успешно создан!"
                );
            }
        };
    }
}
