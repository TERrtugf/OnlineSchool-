import { useEffect, useState } from 'react'

import {
  getLessonTest,
  createTest,
  addQuestion,
  deleteQuestion,
  submitTest,
} from '../../services/testApi'

import TestEditor from './TestEditor'
import TestPassing from './TestPassing'

function TestSection({ lessonId, isAuthor }) {
  const [test, setTest] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [testTitle, setTestTitle] = useState('')
  const [testDescription, setTestDescription] = useState('')
  const [testFormError, setTestFormError] = useState('')
  const [testFormLoading, setTestFormLoading] = useState(false)

  const [questionLoading, setQuestionLoading] = useState(false)
  const [questionError, setQuestionError] = useState('')
  const [deletingQuestionId, setDeletingQuestionId] = useState(null)

  const [selectedAnswers, setSelectedAnswers] = useState({})
  const [result, setResult] = useState(null)
  const [submitLoading, setSubmitLoading] = useState(false)

  useEffect(() => {
    let cancelled = false

    const loadTest = async () => {
      setLoading(true)
      setError('')
      setTest(null)
      setResult(null)
      setSelectedAnswers({})

      try {
        const data = await getLessonTest(lessonId)

        if (!cancelled) {
          setTest(data)
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || 'Не удалось загрузить тест.')
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    if (lessonId != null) {
      loadTest()
    }

    return () => {
      cancelled = true
    }
  }, [lessonId])

  const handleCreateTest = async (event) => {
    event.preventDefault()
    setTestFormError('')

    if (!testTitle.trim()) {
      setTestFormError('Введи название теста.')
      return
    }

    setTestFormLoading(true)

    try {
      const data = await createTest(lessonId, {
        title: testTitle.trim(),
        description: testDescription.trim(),
      })

      setTest(data)
      setTestTitle('')
      setTestDescription('')
    } catch (err) {
      setTestFormError(err.message || 'Не удалось создать тест.')
    } finally {
      setTestFormLoading(false)
    }
  }

  const handleAddQuestion = async (question) => {
    setQuestionError('')
    setQuestionLoading(true)

    try {
      await addQuestion(test.id, question)

      const updatedTest = await getLessonTest(lessonId)
      setTest(updatedTest)
      setSelectedAnswers({})
      setResult(null)

      return true
    } catch (err) {
      setQuestionError(err.message || 'Не удалось добавить вопрос.')
      return false
    } finally {
      setQuestionLoading(false)
    }
  }

  const handleDeleteQuestion = async (question) => {
    if (!window.confirm(
      `Удалить вопрос «${question.text}»? Все варианты ответов также будут удалены.`,
    )) {
      return
    }

    setDeletingQuestionId(question.id)
    setError('')

    try {
      await deleteQuestion(question.id)

      setTest((current) => {
        if (!current) return current

        return {
          ...current,
          questions: (current.questions || []).filter(
            (item) => Number(item.id) !== Number(question.id),
          ),
        }
      })

      setSelectedAnswers({})
      setResult(null)
    } catch (err) {
      setError(err.message || 'Не удалось удалить вопрос.')
    } finally {
      setDeletingQuestionId(null)
    }
  }

  const handleSelectAnswer = (questionId, optionId) => {
    setSelectedAnswers((current) => ({
      ...current,
      [questionId]: optionId,
    }))
  }

  const handleSubmitTest = async () => {
    setError('')

    const questions = test?.questions || []

    if (questions.length === 0) {
      setError('В тесте пока нет вопросов.')
      return
    }

    if (questions.some(
      (question) => selectedAnswers[question.id] == null,
    )) {
      setError('Ответь на все вопросы перед отправкой.')
      return
    }

    setSubmitLoading(true)

    try {
      const data = await submitTest(test.id, selectedAnswers)
      setResult(data)
    } catch (err) {
      setError(err.message || 'Не удалось проверить ответы.')
    } finally {
      setSubmitLoading(false)
    }
  }

  const handleRetry = () => {
    setSelectedAnswers({})
    setResult(null)
    setError('')
  }

  return (
    <div className="lesson-progress test-section">
      <span className="course-category">ПРОВЕРКА ЗНАНИЙ</span>
      <h3>Тест по уроку</h3>

      {loading && <p>Загружаем тест...</p>}

      {!loading && error && (
        <p className="auth-error" role="alert">{error}</p>
      )}

      {!loading && !error && !test && (
        <>
          {isAuthor ? (
            <form
              className="auth-form"
              onSubmit={handleCreateTest}
            >
              <p>Для этого урока ещё не создан тест.</p>

              <label htmlFor="test-title">Название теста</label>

              <input
                id="test-title"
                value={testTitle}
                onChange={(event) => setTestTitle(event.target.value)}
                placeholder="Например, Проверка знаний по Java"
                maxLength={150}
                required
              />

              <label htmlFor="test-description">Описание</label>

              <textarea
                id="test-description"
                value={testDescription}
                onChange={(event) =>
                  setTestDescription(event.target.value)
                }
                placeholder="Описание теста"
                rows={3}
              />

              {testFormError && (
                <p className="auth-error" role="alert">
                  {testFormError}
                </p>
              )}

              <button
                className="register-button"
                type="submit"
                disabled={testFormLoading}
              >
                {testFormLoading ? 'Создаём...' : 'Создать тест'}
              </button>
            </form>
          ) : (
            <p>Для этого урока пока нет теста.</p>
          )}
        </>
      )}

      {!loading && test && (
        <>
          {isAuthor ? (
            <TestEditor
              test={test}
              onAddQuestion={handleAddQuestion}
              onDeleteQuestion={handleDeleteQuestion}
              questionLoading={questionLoading}
              questionError={questionError}
              deletingQuestionId={deletingQuestionId}
              onTestUpdated={setTest}
            />
          ) : (
            <TestPassing
              test={test}
              selectedAnswers={selectedAnswers}
              onSelectAnswer={handleSelectAnswer}
              onSubmit={handleSubmitTest}
              result={result}
              loading={submitLoading}
            />
          )}

          {!isAuthor && result && (
            <button
              className="login-button"
              type="button"
              onClick={handleRetry}
            >
              Пройти тест ещё раз
            </button>
          )}
        </>
      )}
    </div>
  )
}

export default TestSection
