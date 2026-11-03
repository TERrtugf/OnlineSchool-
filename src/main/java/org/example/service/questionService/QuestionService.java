package org.example.service.questionService;

import org.example.domain.question.Question;
import org.example.domain.answerOption.AnswerOption;
import org.example.repository.questionRepository.QuestionRepository;
import org.example.repository.answerOptionRepository.AnswerOptionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class QuestionService {

    private final QuestionRepository questionRepository;
    private final AnswerOptionRepository answerOptionRepository;

    public QuestionService(
            QuestionRepository questionRepository,
            AnswerOptionRepository answerOptionRepository
    ) {
        this.questionRepository = questionRepository;
        this.answerOptionRepository = answerOptionRepository;
    }

    public Question updateQuestion(Long questionId, String text) {
        Question question = questionRepository.findById(questionId)
                .orElseThrow(() -> new RuntimeException("Вопрос не найден"));

        if (text == null || text.isBlank()) {
            throw new RuntimeException("Текст вопроса не может быть пустым");
        }

        question.setText(text);

        return questionRepository.save(question);
    }

    public AnswerOption addAnswerOption(Long questionId, String text, boolean correct) {
        Question question = questionRepository.findById(questionId)
                .orElseThrow(() -> new RuntimeException("Вопрос не найден"));

        if (text == null || text.isBlank()) {
            throw new RuntimeException("Текст ответа не может быть пустым");
        }

        AnswerOption option = new AnswerOption();
        option.setText(text);
        option.setCorrect(correct);
        option.setQuestion(question);

        return answerOptionRepository.save(option);
    }

    public AnswerOption updateAnswerOption(
            Long optionId,
            String text,
            boolean correct
    ) {
        AnswerOption option = answerOptionRepository.findById(optionId)
                .orElseThrow(() -> new RuntimeException("Вариант ответа не найден"));

        if (text == null || text.isBlank()) {
            throw new RuntimeException("Текст ответа не может быть пустым");
        }

        option.setText(text);
        option.setCorrect(correct);

        return answerOptionRepository.save(option);
    }

    @Transactional
    public void deleteAnswerOption(Long optionId) {
        AnswerOption option = answerOptionRepository.findById(optionId)
                .orElseThrow(() -> new RuntimeException("Вариант ответа не найден"));

        answerOptionRepository.delete(option);
    }
}