import { useState } from 'react'
import { getTestById } from '../../services/testApi'
import QuestionEditor from './QuestionEditor'
import QuestionEditForm from './QuestionEditForm'

export default function TestEditor({
  test,
  onAddQuestion,
  onDeleteQuestion,
  questionLoading,
  questionError,
  deletingQuestionId,
  onTestUpdated,
}) {
  const [editingQuestionId, setEditingQuestionId] = useState(null)
  const [editError, setEditError] = useState('')

  async function handleQuestionSaved() {
    try {
      setEditError('')

      const updatedTest = await getTestById(test.id)

      onTestUpdated(updatedTest)
      setEditingQuestionId(null)
    } catch (error) {
      setEditError(
        error.message || 'Изменения сохранены, но не удалось обновить тест'
      )
    }
  }

  return (
    <div className="test-editor">
      <h3>{test.title}</h3>

      {test.description && <p>{test.description}</p>}

      <p>Количество вопросов: {test.questions?.length || 0}</p>

      <h4>Добавить вопрос</h4>

      <QuestionEditor
        onAddQuestion={onAddQuestion}
        loading={questionLoading}
      />

      {questionError && (
        <p className="error-message">{questionError}</p>
      )}

      <h4>Вопросы теста</h4>

      {!test.questions?.length && (
        <p>В этом тесте пока нет вопросов.</p>
      )}

      {test.questions?.map((question, index) => (
        <div key={question.id} className="test-question">
          {editingQuestionId === question.id ? (
            <QuestionEditForm
              question={question}
              onSave={handleQuestionSaved}
              onCancel={() => setEditingQuestionId(null)}
            />
          ) : (
            <>
              <h5>
                {index + 1}. {question.text}
              </h5>

              <ul>
                {question.answerOptions?.map(option => (
                  <li key={option.id}>{option.text}</li>
                ))}
              </ul>

              <button
                type="button"
                onClick={() => {
                  setEditError('')
                  setEditingQuestionId(question.id)
                }}
              >
                Редактировать
              </button>

              <button
                type="button"
                onClick={() => onDeleteQuestion(question)}
                disabled={deletingQuestionId === question.id}
              >
                {deletingQuestionId === question.id
                  ? 'Удаление...'
                  : 'Удалить вопрос'}
              </button>
            </>
          )}
        </div>
      ))}

      {editError && <p className="error-message">{editError}</p>}
    </div>
  )
}
