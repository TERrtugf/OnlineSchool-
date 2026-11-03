package org.example.controller;

import org.example.domain.answerOption.AnswerOption;
import org.example.domain.question.Question;
import org.example.domain.test.Test;

import org.example.dto.CreateQuestionRequest;
import org.example.dto.CreateTestRequest;
import org.example.dto.SubmitAnswersRequest;
import org.example.dto.TestResponse;
import org.example.dto.TestResult;
import org.example.dto.AuthorAnswerOptionResponse;

import org.example.service.testService.TestService;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class TestController {

    private final TestService testService;

    public TestController(TestService testService) {
        this.testService = testService;
    }

    @PostMapping("/lessons/{lessonId}/tests")
    @ResponseStatus(HttpStatus.CREATED)
    public TestResponse createTest(
            @PathVariable Long lessonId,
            @Valid @RequestBody CreateTestRequest request,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        Test test = testService.createTest(
                lessonId,
                request,
                userDetails.getUsername()
        );

        return convertToResponse(test, false);
    }

    @PostMapping("/tests/{testId}/questions")
    @ResponseStatus(HttpStatus.CREATED)
    public TestResponse.QuestionResponse addQuestion(
            @PathVariable Long testId,
            @Valid @RequestBody CreateQuestionRequest request,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        Question question = testService.addQuestion(
                testId,
                request,
                userDetails.getUsername()
        );

        return convertQuestionToResponse(question);
    }

    @DeleteMapping("/questions/{questionId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteQuestion(
            @PathVariable Long questionId,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        testService.deleteQuestion(
                questionId,
                userDetails.getUsername()
        );
    }

    @PostMapping("/questions/{questionId}/answers")
    @ResponseStatus(HttpStatus.CREATED)
    public TestResponse.AnswerOptionResponse addAnswerOption(
            @PathVariable Long questionId,
            @Valid @RequestBody AnswerOptionRequest request,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        AnswerOption option = testService.addAnswerOption(
                questionId,
                request.text(),
                request.correct(),
                userDetails.getUsername()
        );

        return new TestResponse.AnswerOptionResponse(
                option.getId(),
                option.getText()
        );
    }

    @DeleteMapping("/answer-options/{optionId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteAnswerOption(
            @PathVariable Long optionId,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        testService.deleteAnswerOption(
                optionId,
                userDetails.getUsername()
        );
    }

    @GetMapping("/tests/{testId}")
    public TestResponse getTest(
            @PathVariable Long testId
    ) {
        Test test = testService.getTestById(testId);
        return convertToResponse(test, true);
    }

    @GetMapping("/lessons/{lessonId}/tests")
    public TestResponse getTestByLesson(
            @PathVariable Long lessonId
    ) {
        Test test = testService.getTestByLessonId(lessonId);
        return convertToResponse(test, true);
    }

    @PostMapping("/tests/{testId}/submit")
    public TestResult submitAnswers(
            @PathVariable Long testId,
            @RequestBody SubmitAnswersRequest request
    ) {
        return testService.checkAnswers(
                testId,
                request.answers()
        );
    }

    private TestResponse convertToResponse(
            Test test,
            boolean includeQuestions
    ) {
        List<TestResponse.QuestionResponse> questions =
                includeQuestions
                        ? test.getQuestions().stream()
                        .map(this::convertQuestionToResponse)
                        .toList()
                        : List.of();

        return new TestResponse(
                test.getId(),
                test.getTitle(),
                test.getDescription(),
                questions
        );
    }

    private TestResponse.QuestionResponse convertQuestionToResponse(
            Question question
    ) {
        List<TestResponse.AnswerOptionResponse> options =
                question.getAnswerOptions().stream()
                        .map(option ->
                                new TestResponse.AnswerOptionResponse(
                                        option.getId(),
                                        option.getText()
                                )
                        )
                        .toList();

        return new TestResponse.QuestionResponse(
                question.getId(),
                question.getText(),
                options
        );
    }

    public record AnswerOptionRequest(
            @NotBlank String text,
            boolean correct
    ) {
    }

    @GetMapping("/questions/{questionId}/author-answers")
    public List<AuthorAnswerOptionResponse> getAnswerOptionsForAuthor(
            @PathVariable Long questionId,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        return testService.getAnswerOptionsForAuthor(
                questionId,
                userDetails.getUsername()
        );
    }
}
