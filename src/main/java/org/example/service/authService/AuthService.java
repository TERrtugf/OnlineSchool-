package org.example.service.authService;

import org.example.controller.RegisterRequest;
import org.example.domain.user.User;
import org.example.domain.user.UserRole;
import org.example.repository.userRepository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public User register(RegisterRequest request) {

        if (userRepository.existsByUsername(request.username())) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Пользователь с таким логином уже существует"
            );
        }

        User user = new User();
        user.setUsername(request.username());

        user.setPassword(
                passwordEncoder.encode(request.password())
        );

        user.setRole(UserRole.USER);

        return userRepository.save(user);
    }
}