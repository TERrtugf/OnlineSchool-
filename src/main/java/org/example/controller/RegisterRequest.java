package org.example.controller;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record RegisterRequest(

        @NotBlank(message = "Логин не должен быть пустым")
        @Size(min = 3, max = 50,
                message = "Логин должен содержать от 3 до 50 символов")
        String username,

        @NotBlank(message = "Пароль не должен быть пустым")
        @Size(min = 8, max = 72,
                message = "Пароль должен содержать от 8 до 72 символов")
        String password

) {
}