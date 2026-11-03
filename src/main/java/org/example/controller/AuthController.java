package org.example.controller;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;

import org.example.domain.user.User;
import org.example.repository.userRepository.UserRepository;
import org.example.service.authService.AuthService;

import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.context.SecurityContextRepository;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;
    private final UserRepository userRepository;
    private final AuthenticationManager authenticationManager;
    private final SecurityContextRepository securityContextRepository;

    public AuthController(
            AuthService authService,
            UserRepository userRepository,
            AuthenticationManager authenticationManager,
            SecurityContextRepository securityContextRepository) {

        this.authService = authService;
        this.userRepository = userRepository;
        this.authenticationManager = authenticationManager;
        this.securityContextRepository = securityContextRepository;
    }

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public UserResponse register(
            @Valid @RequestBody RegisterRequest request) {

        User user = authService.register(request);

        return new UserResponse(
                user.getId(),
                user.getUsername(),
                user.getRole().name()
        );
    }

    @PostMapping("/login")
    public UserResponse login(
            @RequestBody LoginRequest request,
            HttpServletRequest httpRequest,
            HttpServletResponse httpResponse) {

        try {
            Authentication authentication =
                    authenticationManager.authenticate(
                            new UsernamePasswordAuthenticationToken(
                                    request.username(),
                                    request.password()
                            )
                    );

            SecurityContext context =
                    SecurityContextHolder.createEmptyContext();

            context.setAuthentication(authentication);
            SecurityContextHolder.setContext(context);

            securityContextRepository.saveContext(
                    context,
                    httpRequest,
                    httpResponse
            );

            User user = userRepository
                    .findByUsername(authentication.getName())
                    .orElseThrow(() -> new ResponseStatusException(
                            HttpStatus.UNAUTHORIZED,
                            "Пользователь не найден"
                    ));

            return new UserResponse(
                    user.getId(),
                    user.getUsername(),
                    user.getRole().name()
            );

        } catch (AuthenticationException exception) {

            SecurityContextHolder.clearContext();

            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Неверный логин или пароль"
            );
        }
    }

    @GetMapping("/me")
    public UserResponse getCurrentUser(
            Authentication authentication) {

        if (authentication == null
                || !authentication.isAuthenticated()
                || authentication instanceof AnonymousAuthenticationToken) {

            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Пользователь не авторизован"
            );
        }

        User user = userRepository
                .findByUsername(authentication.getName())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Пользователь не найден"
                ));

        return new UserResponse(
                user.getId(),
                user.getUsername(),
                user.getRole().name()
        );
    }

    @PostMapping("/logout")
    public MessageResponse logout(
            HttpServletRequest request,
            HttpServletResponse response) {

        SecurityContextHolder.clearContext();

        HttpSession session = request.getSession(false);

        if (session != null) {
            session.invalidate();
        }

        return new MessageResponse("Выход выполнен");
    }

    public record LoginRequest(
            String username,
            String password
    ) {
    }

    public record UserResponse(
            Long id,
            String username,
            String role
    ) {
    }

    public record MessageResponse(String message) {
    }
}
