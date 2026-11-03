package org.example.service.testService;

import org.example.domain.answerOption.AnswerOption;
import org.example.domain.course.Course;
import org.example.domain.lesson.Lesson;
import org.example.domain.question.Question;
import org.example.domain.test.Test;
import org.example.domain.user.User;

import org.example.dto.CreateQuestionRequest;
import org.example.dto.CreateTestRequest;
import org.example.dto.TestResult;

import org.example.repository.answerOptionRepository.AnswerOptionRepository;
import org.example.repository.lessonRepository.LessonRepository;
import org.example.repository.questionRepository.QuestionRepository;
import org.example.repository.testRepository.TestRepository;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import org.example.dto.AuthorAnswerOptionResponse;

import java.util.List;
import java.util.Map;

@Service
public class TestService {

    private final TestRepository testRepository;
    private final QuestionRepository questionRepository;
    private final AnswerOptionRepository answerOptionRepository;
    private final LessonRepository lessonRepository;

    public TestService(
            TestRepository testRepository,
            QuestionRepository questionRepository,
            AnswerOptionRepository answerOptionRepository,
            LessonRepository lessonRepository
    ) {
        this.testRepository = testRepository;
        this.questionRepository = questionRepository;
        this.answerOptionRepository = answerOptionRepository;
        this.lessonRepository = lessonRepository;
    }

    @Transactional
    public Test createTest(
            Long lessonId,
            CreateTestRequest request,
            String username
    ) {
        Lesson lesson = lessonRepository.findById(lessonId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Урок не найден"
                ));

        checkLessonOwner(lesson, username);

        if (testRepository.existsByLessonId(lessonId)) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Для этого урока уже существует тест"
            );
        }

        Test test = new Test();
        test.setTitle(request.getTitle());
        test.setDescription(request.getDescription());
        test.setLesson(lesson);

        return testRepository.save(test);
    }

    @Transactional
    public Question addQuestion(
            Long testId,
            CreateQuestionRequest request,
            String username
    ) {
        Test test = testRepository.findById(testId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Тест не найден"
                ));

        checkLessonOwner(test.getLesson(), username);

        List<CreateQuestionRequest.AnswerOptionRequest> options =
                request.getAnswerOptions();

        long correctCount = options.stream()
                .filter(CreateQuestionRequest.AnswerOptionRequest::isCorrect)
                .count();

        if (correctCount != 1) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "У вопроса должен быть ровно один правильный ответ"
            );
        }

        Question question = new Question();
        question.setText(request.getText());
        question.setTest(test);

        for (CreateQuestionRequest.AnswerOptionRequest optionRequest : options) {
            AnswerOption option = new AnswerOption();

            option.setText(optionRequest.getText());
            option.setCorrect(optionRequest.isCorrect());
            option.setQuestion(question);

            question.getAnswerOptions().add(option);
        }

        return questionRepository.save(question);
    }

    @Transactional
    public void deleteQuestion(
            Long questionId,
            String username
    ) {
        Question question = questionRepository.findById(questionId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Вопрос не найден"
                ));

        checkLessonOwner(
                question.getTest().getLesson(),
                username
        );

        answerOptionRepository.deleteAll(
                question.getAnswerOptions()
        );

        questionRepository.delete(question);
    }

    @Transactional
    public Question updateQuestion(
            Long questionId,
            String text,
            String username
    ) {
        Question question = questionRepository.findById(questionId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Вопрос не найден"
                ));

        checkLessonOwner(question.getTest().getLesson(), username);

        if (text == null || text.isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Текст вопроса не может быть пустым"
            );
        }

        question.setText(text.trim());

        return questionRepository.save(question);
    }

    @Transactional
    public AnswerOption addAnswerOption(
            Long questionId,
            String text,
            boolean correct,
            String username
    ) {
        Question question = questionRepository.findById(questionId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Вопрос не найден"
                ));

        checkLessonOwner(question.getTest().getLesson(), username);

        if (text == null || text.isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Текст ответа не может быть пустым"
            );
        }

        AnswerOption option = new AnswerOption();
        option.setText(text.trim());
        option.setQuestion(question);
        option.setCorrect(correct);

        if (correct) {
            for (AnswerOption existing : question.getAnswerOptions()) {
                existing.setCorrect(false);
            }
        }

        question.getAnswerOptions().add(option);
        questionRepository.save(question);

        return option;
    }

    @Transactional
    public AnswerOption updateAnswerOption(
            Long optionId,
            String text,
            boolean correct,
            String username
    ) {
        AnswerOption option = answerOptionRepository.findById(optionId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Вариант ответа не найден"
                ));

        Question question = option.getQuestion();

        checkLessonOwner(question.getTest().getLesson(), username);

        if (text == null || text.isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Текст ответа не может быть пустым"
            );
        }

        if (!correct && option.isCorrect()) {
            long correctCount = question.getAnswerOptions().stream()
                    .filter(AnswerOption::isCorrect)
                    .count();

            if (correctCount <= 1) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "У вопроса должен оставаться один правильный ответ"
                );
            }
        }

        if (correct) {
            for (AnswerOption existing : question.getAnswerOptions()) {
                existing.setCorrect(false);
            }
        }

        option.setText(text.trim());
        option.setCorrect(correct);

        return answerOptionRepository.save(option);
    }

    @Transactional
    public void deleteAnswerOption(
            Long optionId,
            String username
    ) {
        AnswerOption option = answerOptionRepository.findById(optionId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Вариант ответа не найден"
                ));

        Question question = option.getQuestion();

        checkLessonOwner(question.getTest().getLesson(), username);

        if (option.isCorrect()) {
            long correctCount = question.getAnswerOptions().stream()
                    .filter(AnswerOption::isCorrect)
                    .count();

            if (correctCount <= 1) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Нельзя удалить единственный правильный ответ"
                );
            }
        }

        if (question.getAnswerOptions().size() <= 2) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "У вопроса должно быть минимум два варианта ответа"
            );
        }

        question.getAnswerOptions().remove(option);
        questionRepository.save(question);
    }

    @Transactional(readOnly = true)
    public Test getTestById(Long testId) {
        Test test = testRepository.findById(testId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Тест не найден"
                ));

        test.getQuestions().forEach(question ->
                question.getAnswerOptions().size()
        );

        return test;
    }

    @Transactional(readOnly = true)
    public Test getTestByLessonId(Long lessonId) {
        Test test = testRepository.findByLessonId(lessonId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Для этого урока тест не найден"
                ));

        test.getQuestions().forEach(question ->
                question.getAnswerOptions().size()
        );

        return test;
    }

    @Transactional(readOnly = true)
    public TestResult checkAnswers(
            Long testId,
            Map<Long, Long> answers
    ) {
        getTestById(testId);

        List<Question> questions =
                questionRepository.findByTestId(testId);

        if (questions.isEmpty()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "В тесте пока нет вопросов"
            );
        }

        if (answers == null || answers.size() != questions.size()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Необходимо ответить на все вопросы теста"
            );
        }

        int correctAnswers = 0;

        for (Question question : questions) {
            Long selectedOptionId = answers.get(question.getId());

            if (selectedOptionId == null) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Необходимо ответить на все вопросы теста"
                );
            }

            AnswerOption selectedOption = answerOptionRepository
                    .findById(selectedOptionId)
                    .orElseThrow(() -> new ResponseStatusException(
                            HttpStatus.BAD_REQUEST,
                            "Выбранный вариант ответа не найден"
                    ));

            if (!selectedOption.getQuestion().getId()
                    .equals(question.getId())) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Выбранный вариант не относится к этому вопросу"
                );
            }

            if (selectedOption.isCorrect()) {
                correctAnswers++;
            }
        }

        return new TestResult(
                questions.size(),
                correctAnswers
        );
    }

    private void checkLessonOwner(
            Lesson lesson,
            String username
    ) {
        Course course = lesson.getCourse();
        User author = course.getAuthor();

        if (!author.getUsername().equals(username)) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Вы не являетесь автором этого курса"
            );
        }
    }

    @Transactional(readOnly = true)
    public List<AuthorAnswerOptionResponse> getAnswerOptionsForAuthor(
            Long questionId,
            String username
    ) {
        Question question = questionRepository.findById(questionId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Вопрос не найден"
                ));

        checkLessonOwner(question.getTest().getLesson(), username);

        return question.getAnswerOptions().stream()
                .map(option -> new AuthorAnswerOptionResponse(
                        option.getId(),
                        option.getText(),
                        option.isCorrect()
                ))
                .toList();
    }
}
