package org.example.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class CreateTestRequest {

    @NotBlank(message = "Название теста не может быть пустым")
    @Size(max = 255, message = "Название не должно превышать 255 символов")
    private String title;

    private String description;

    public CreateTestRequest() {
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }
}
