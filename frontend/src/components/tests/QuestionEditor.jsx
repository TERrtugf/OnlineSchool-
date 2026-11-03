import { useState } from 'react'

function QuestionEditor({ onAddQuestion, loading, error }) {
  const [questionText, setQuestionText] = useState('')
  const [answerOptions, setAnswerOptions] = useState([
    { text: '', correct: true },
    { text: '', correct: false },
  ])

  const updateAnswerOption = (index, text) => {
    setAnswerOptions((current) =>
      current.map((option, i) =>
        i === index ? { ...option, text } : option,
      ),
    )
  }

  const selectCorrectAnswer = (index) => {
    setAnswerOptions((current) =>
      current.map((option, i) => ({
        ...option,
        correct: i === index,
      })),
    )
  }

  const addAnswerOption = () => {
    setAnswerOptions((current) => [
      ...current,
      { text: '', correct: false },
    ])
  }

  const removeAnswerOption = (index) => {
    if (answerOptions.length <= 2) {
      return
    }

    setAnswerOptions((current) => {
      const updated = current.filter((_, i) => i !== index)

      if (!updated.some((option) => option.correct)) {
        updated[0].correct = true
      }

      return updated
    })
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (!questionText.trim()) {
      return
    }

    if (answerOptions.some((option) => !option.text.trim())) {
      return
    }

    if (!answerOptions.some((option) => option.correct)) {
      return
    }

    const success = await onAddQuestion({
      text: questionText.trim(),
      answerOptions: answerOptions.map((option) => ({
        text: option.text.trim(),
        correct: option.correct,
      })),
    })

    if (success) {
      setQuestionText('')
      setAnswerOptions([
        { text: '', correct: true },
        { text: '', correct: false },
      ])
    }
  }

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      <label htmlFor="question-text">Текст вопроса</label>

      <textarea
        id="question-text"
        value={questionText}
        onChange={(event) => setQuestionText(event.target.value)}
        placeholder="Введи вопрос..."
        rows={3}
        required
      />

      <label>Варианты ответов</label>

      {answerOptions.map((option, index) => (
        <div className="test-option-editor" key={index}>
          <input
            type="radio"
            name="correct-answer"
            checked={option.correct}
            onChange={() => selectCorrectAnswer(index)}
            aria-label={`Правильный вариант ${index + 1}`}
          />

          <input
            type="text"
            value={option.text}
            onChange={(event) =>
              updateAnswerOption(index, event.target.value)
            }
            placeholder={`Вариант ${index + 1}`}
            required
          />

          <button
            className="login-button"
            type="button"
            disabled={answerOptions.length <= 2}
            onClick={() => removeAnswerOption(index)}
          >
            Удалить
          </button>
        </div>
      ))}

      <p className="test-hint">
        Отметь кружком правильный вариант ответа.
      </p>

      <button
        className="login-button"
        type="button"
        onClick={addAnswerOption}
      >
        + Добавить вариант
      </button>

      {error && (
        <p className="auth-error" role="alert">{error}</p>
      )}

      <button
        className="register-button"
        type="submit"
        disabled={loading}
      >
        {loading ? 'Добавляем...' : 'Добавить вопрос'}
      </button>
    </form>
  )
}

export default QuestionEditor
