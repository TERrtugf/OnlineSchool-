function TestPassing({
  test,
  selectedAnswers,
  onSelectAnswer,
  onSubmit,
  result,
  loading,
}) {
  const questions = test.questions || []

  if (questions.length === 0) {
    return <p>Автор ещё не добавил вопросы.</p>
  }

  return (
    <div>
      <div className="test-questions">
        {questions.map((question, index) => (
          <div className="test-question" key={question.id}>
            <h4>
              {index + 1}. {question.text}
            </h4>

            {(question.answerOptions || []).map((option) => (
              <label
                className="test-answer-option"
                key={option.id}
              >
                <input
                  type="radio"
                  name={`question-${question.id}`}
                  checked={
                    Number(selectedAnswers[question.id]) ===
                    Number(option.id)
                  }
                  onChange={() =>
                    onSelectAnswer(question.id, option.id)
                  }
                  disabled={Boolean(result)}
                />

                <span>{option.text}</span>
              </label>
            ))}
          </div>
        ))}
      </div>

      {!result && (
        <button
          className="register-button"
          type="button"
          onClick={onSubmit}
          disabled={loading}
        >
          {loading ? 'Проверяем ответы...' : 'Отправить ответы'}
        </button>
      )}

      {result && (
        <div className="test-result">
          <h3>Результат тестирования</h3>

          <p>
            Правильных ответов:{' '}
            <strong>
              {result.correctAnswers} из {result.totalQuestions}
            </strong>
          </p>

          <p>
            Результат: <strong>{result.percentage}%</strong>
          </p>
        </div>
      )}
    </div>
  )
}

export default TestPassing
