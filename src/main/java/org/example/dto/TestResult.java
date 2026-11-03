package org.example.dto;

public class TestResult {

    private int totalQuestions;

    private int correctAnswers;

    private double percentage;

    public TestResult() {
    }

    public TestResult(int totalQuestions, int correctAnswers) {
        this.totalQuestions = totalQuestions;
        this.correctAnswers = correctAnswers;

        if (totalQuestions > 0) {
            this.percentage = (double) correctAnswers / totalQuestions * 100;
        } else {
            this.percentage = 0;
        }
    }

    public int getTotalQuestions() {
        return totalQuestions;
    }

    public int getCorrectAnswers() {
        return correctAnswers;
    }

    public double getPercentage() {
        return percentage;
    }
}
