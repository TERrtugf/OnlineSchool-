package org.example.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;

import java.util.List;

public class CreateQuestionRequest {

    @NotBlank(message = "Текст вопроса не может быть пустым")
    private String text;

    @NotEmpty(message = "Добавьте варианты ответов")
    @Size(min = 2, max = 10, message = "Количество вариантов должно быть от 2 до 10")
    private List<AnswerOptionRequest> answerOptions;

    public CreateQuestionRequest() {
    }

    public String getText() {
        return text;
    }

    public void setText(String text) {
        this.text = text;
    }

    public List<AnswerOptionRequest> getAnswerOptions() {
        return answerOptions;
    }

    public void setAnswerOptions(List<AnswerOptionRequest> answerOptions) {
        this.answerOptions = answerOptions;
    }

    public static class AnswerOptionRequest {

        @NotBlank(message = "Текст варианта ответа не может быть пустым")
        private String text;

        private boolean correct;

        public AnswerOptionRequest() {
        }

        public String getText() {
            return text;
        }

        public void setText(String text) {
            this.text = text;
        }

        public boolean isCorrect() {
            return correct;
        }

        public void setCorrect(boolean correct) {
            this.correct = correct;
        }
    }
}
