package org.example;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfig {

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http)
            throws Exception {

        http
                .csrf(csrf -> csrf.disable())
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(
                                "/",
                                "/index.html",
                                "/assets/**",
                                "/api/auth/**",
                                "/api/courses",
                                "/api/courses/**",
                                "/h2-console/**"
                        ).permitAll()
                        .anyRequest().authenticated()
                )
                .headers(headers -> headers
                        .frameOptions(frame -> frame.sameOrigin())
                )
                .httpBasic(Customizer.withDefaults());

        return http.build();
    }
}
