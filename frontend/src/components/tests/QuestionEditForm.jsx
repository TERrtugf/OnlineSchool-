import { useEffect, useState } from 'react'
import {
  getAuthorAnswers,
  updateQuestion,
  updateAnswerOption,
  addAnswerOption,
  deleteAnswerOption,
} from '../../services/testApi'

export default function QuestionEditForm({ question, onSave, onCancel }) {
  const [text, setText] = useState(question.text || '')
  const [options, setOptions] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false

    async function loadOptions() {
      try {
        setLoading(true)
        setError('')

        const data = await getAuthorAnswers(question.id)

        if (!cancelled) {
          setOptions(
            data.map(option => ({
              id: option.id,
              text: option.text,
              correct: option.correct,
              isNew: false,
              deleted: false,
            }))
          )
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || 'Не удалось загрузить варианты ответов')
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    loadOptions()

    return () => {
      cancelled = true
    }
  }, [question.id])

  function updateOption(index, field, value) {
    setOptions(current =>
      current.map((option, i) =>
        i === index ? { ...option, [field]: value } : option
      )
    )
  }

  function selectCorrect(index) {
    setOptions(current =>
      current.map((option, i) => ({
        ...option,
        correct: i === index,
      }))
    )
  }

  function addOption() {
    setOptions(current => [
      ...current,
      {
        id: null,
        text: '',
        correct: false,
        isNew: true,
        deleted: false,
      },
    ])
  }

  function removeOption(index) {
    setOptions(current => {
      const option = current[index]
      const remaining = current.filter((_, i) => i !== index)

      if (option.correct && remaining.length > 0) {
        remaining[0] = { ...remaining[0], correct: true }
      }

      if (option.isNew) {
        return remaining
      }

      return current.map((item, i) =>
        i === index ? { ...item, deleted: true } : item
      )
    })
  }

  async function handleSave() {
    const activeOptions = options.filter(option => !option.deleted)

    if (!text.trim()) {
      setError('Введите текст вопроса')
      return
    }

    if (activeOptions.length < 2) {
      setError('У вопроса должно быть минимум два варианта ответа')
      return
    }

    if (activeOptions.some(option => !option.text.trim())) {
      setError('Заполните текст всех вариантов ответа')
      return
    }

    if (activeOptions.filter(option => option.correct).length !== 1) {
      setError('Выберите один правильный ответ')
      return
    }

    try {
      setSaving(true)
      setError('')

      await updateQuestion(question.id, text.trim())

      for (const option of activeOptions) {
        if (!option.isNew) {
          await updateAnswerOption(option.id, {
            text: option.text.trim(),
            correct: option.correct,
          })
        }
      }

      for (const option of activeOptions) {
        if (option.isNew) {
          await addAnswerOption(question.id, {
            text: option.text.trim(),
            correct: option.correct,
          })
        }
      }

      for (const option of options) {
        if (option.deleted) {
          await deleteAnswerOption(option.id)
        }
      }

      await onSave()
    } catch (err) {
      setError(err.message || 'Не удалось сохранить изменения')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <p>Загрузка вариантов ответов...</p>
  }

  return (
    <div className="question-edit-form">
      <h4>Редактирование вопроса</h4>

      <label>
        Текст вопроса
        <textarea
          value={text}
          onChange={event => setText(event.target.value)}
          rows={3}
        />
      </label>

      <h4>Варианты ответов</h4>

      {options.map((option, index) => {
        if (option.deleted) return null

        return (
          <div key={option.id ?? `new-${index}`} className="answer-edit-row">
            <input
              type="radio"
              name={`correct-${question.id}`}
              checked={option.correct}
              onChange={() => selectCorrect(index)}
              title="Правильный ответ"
            />

            <input
              type="text"
              value={option.text}
              onChange={event =>
                updateOption(index, 'text', event.target.value)
              }
              placeholder={`Вариант ${index + 1}`}
            />

            <button
              type="button"
              onClick={() => removeOption(index)}
              disabled={options.filter(item => !item.deleted).length <= 2}
            >
              Удалить
            </button>
          </div>
        )
      })}

      <button type="button" onClick={addOption}>
        Добавить вариант
      </button>

      {error && <p className="error-message">{error}</p>}

      <div className="question-edit-actions">
        <button type="button" onClick={handleSave} disabled={saving}>
          {saving ? 'Сохранение...' : 'Сохранить'}
        </button>

        <button type="button" onClick={onCancel} disabled={saving}>
          Отмена
        </button>
      </div>
    </div>
  )
}
