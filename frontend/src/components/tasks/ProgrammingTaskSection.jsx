import { useEffect, useState } from 'react'
import './ProgrammingTaskSection.css'

const EMPTY_TASK = {
  title: '',
  description: '',
  inputDescription: '',
  outputDescription: '',
  examples: '',
  programmingLanguage: 'Java',
  starterCode: '',
}

function ProgrammingTaskSection({ lessonId, isAuthor, user }) {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [taskForm, setTaskForm] = useState(EMPTY_TASK)
  const [editingTaskId, setEditingTaskId] = useState(null)
  const [showTaskForm, setShowTaskForm] = useState(false)
  const [savingTask, setSavingTask] = useState(false)

  const [codeByTask, setCodeByTask] = useState({})
  const [submittingTaskId, setSubmittingTaskId] = useState(null)
  const [submissionsByTask, setSubmissionsByTask] = useState({})

  const [pendingSubmissions, setPendingSubmissions] = useState([])
  const [reviewData, setReviewData] = useState({})
  const [reviewingId, setReviewingId] = useState(null)

  const loadTasks = async () => {
    setLoading(true)
    setError('')

    try {
      const response = await fetch(
        `/api/lessons/${lessonId}/tasks`,
        {
          credentials: 'include',
        },
      )

      if (!response.ok) {
        throw new Error(
          `Не удалось загрузить задания. HTTP ${response.status}`,
        )
      }

      const data = await response.json()
      const taskList = Array.isArray(data) ? data : []

      setTasks(taskList)

      return taskList
    } catch (err) {
      console.error('Ошибка загрузки заданий:', err)
      setError(err.message || 'Не удалось загрузить задания.')
      return []
    } finally {
      setLoading(false)
    }
  }

  const loadMySubmissions = async (taskList) => {
    if (!user || isAuthor) return

    try {
      const results = await Promise.all(
        taskList.map(async (task) => {
          const response = await fetch(
            `/api/tasks/${task.id}/submissions/my`,
            {
              credentials: 'include',
            },
          )

          if (!response.ok) {
            throw new Error(
              `Не удалось загрузить решения задания "${task.title}".`,
            )
          }

          const data = await response.json()

          return {
            taskId: task.id,
            submissions: Array.isArray(data) ? data : [],
          }
        }),
      )

      const resultMap = {}

      results.forEach((item) => {
        resultMap[item.taskId] = item.submissions
      })

      setSubmissionsByTask(resultMap)
    } catch (err) {
      console.error('Ошибка загрузки решений:', err)
      setError(err.message || 'Не удалось загрузить отправленные решения.')
    }
  }

  const loadPendingSubmissions = async () => {
    if (!isAuthor) return

    try {
      const response = await fetch('/api/submissions/pending', {
        credentials: 'include',
      })

      if (!response.ok) {
        throw new Error(
          `Не удалось загрузить отправленные решения. HTTP ${response.status}`,
        )
      }

      const data = await response.json()
      setPendingSubmissions(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('Ошибка загрузки решений для проверки:', err)
      setError(err.message || 'Не удалось загрузить решения для проверки.')
    }
  }

  useEffect(() => {
    const initialize = async () => {
      const taskList = await loadTasks()

      if (isAuthor) {
        await loadPendingSubmissions()
      } else if (user) {
        await loadMySubmissions(taskList)
      }
    }

    initialize()
  }, [lessonId, isAuthor, user?.id])

  const handleTaskFormChange = (event) => {
    const { name, value } = event.target

    setTaskForm((current) => ({
      ...current,
      [name]: value,
    }))
  }

  const openCreateForm = () => {
    setTaskForm(EMPTY_TASK)
    setEditingTaskId(null)
    setShowTaskForm(true)
    setError('')
    setSuccess('')
  }

  const openEditForm = (task) => {
    setTaskForm({
      title: task.title || '',
      description: task.description || '',
      inputDescription: task.inputDescription || '',
      outputDescription: task.outputDescription || '',
      examples: task.examples || '',
      programmingLanguage: task.programmingLanguage || 'Java',
      starterCode: task.starterCode || '',
    })

    setEditingTaskId(task.id)
    setShowTaskForm(true)
    setError('')
    setSuccess('')
  }

  const handleSaveTask = async (event) => {
    event.preventDefault()

    setError('')
    setSuccess('')

    if (!taskForm.title.trim()) {
      setError('Введи название задания.')
      return
    }

    if (!taskForm.description.trim()) {
      setError('Введи условие задания.')
      return
    }

    if (!taskForm.programmingLanguage.trim()) {
      setError('Укажи язык программирования.')
      return
    }

    setSavingTask(true)

    try {
      const isEditing = editingTaskId !== null

      const response = await fetch(
        isEditing
          ? `/api/tasks/${editingTaskId}`
          : `/api/lessons/${lessonId}/tasks`,
        {
          method: isEditing ? 'PUT' : 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title: taskForm.title.trim(),
            description: taskForm.description.trim(),
            inputDescription: taskForm.inputDescription.trim(),
            outputDescription: taskForm.outputDescription.trim(),
            examples: taskForm.examples.trim(),
            programmingLanguage: taskForm.programmingLanguage.trim(),
            starterCode: taskForm.starterCode,
          }),
        },
      )

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))

        throw new Error(
          data.message ||
            data.detail ||
            `Не удалось сохранить задание. HTTP ${response.status}`,
        )
      }

      await loadTasks()

      setShowTaskForm(false)
      setTaskForm(EMPTY_TASK)
      setEditingTaskId(null)

      setSuccess(
        isEditing
          ? 'Задание успешно обновлено.'
          : 'Новое задание успешно создано.',
      )
    } catch (err) {
      console.error('Ошибка сохранения задания:', err)
      setError(err.message || 'Не удалось сохранить задание.')
    } finally {
      setSavingTask(false)
    }
  }

  const handleDeleteTask = async (task) => {
    const confirmed = window.confirm(
      `Удалить задание "${task.title}"?\n\nВсе отправленные решения этого задания также будут удалены.`,
    )

    if (!confirmed) return

    setError('')
    setSuccess('')

    try {
      const response = await fetch(`/api/tasks/${task.id}`, {
        method: 'DELETE',
        credentials: 'include',
      })

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))

        throw new Error(
          data.message ||
            data.detail ||
            `Не удалось удалить задание. HTTP ${response.status}`,
        )
      }

      setTasks((current) =>
        current.filter((item) => item.id !== task.id),
      )

      setPendingSubmissions((current) =>
        current.filter((item) => item.taskId !== task.id),
      )

      setSuccess('Задание удалено.')
    } catch (err) {
      console.error('Ошибка удаления задания:', err)
      setError(err.message || 'Не удалось удалить задание.')
    }
  }

  const handleCodeChange = (taskId, value) => {
    setCodeByTask((current) => ({
      ...current,
      [taskId]: value,
    }))
  }

  const handleSubmitCode = async (task) => {
    if (!user) {
      setError('Для отправки решения необходимо войти в аккаунт.')
      return
    }

    const submittedCode = codeByTask[task.id] || ''

    if (!submittedCode.trim()) {
      setError('Сначала напиши решение задания.')
      return
    }

    setSubmittingTaskId(task.id)
    setError('')
    setSuccess('')

    try {
      const response = await fetch(
        `/api/tasks/${task.id}/submissions`,
        {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            submittedCode,
          }),
        },
      )

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))

        throw new Error(
          data.message ||
            data.detail ||
            `Не удалось отправить решение. HTTP ${response.status}`,
        )
      }

      const newSubmission = await response.json()

      setSubmissionsByTask((current) => ({
        ...current,
        [task.id]: [
          newSubmission,
          ...(current[task.id] || []),
        ],
      }))

      setCodeByTask((current) => ({
        ...current,
        [task.id]: '',
      }))

      setSuccess('Решение отправлено преподавателю на проверку.')
    } catch (err) {
      console.error('Ошибка отправки решения:', err)
      setError(err.message || 'Не удалось отправить решение.')
    } finally {
      setSubmittingTaskId(null)
    }
  }

  const handleReviewChange = (submissionId, field, value) => {
    setReviewData((current) => ({
      ...current,
      [submissionId]: {
        ...current[submissionId],
        [field]: value,
      },
    }))
  }

  const handleReviewSubmission = async (submission, status) => {
    const currentReview = reviewData[submission.id] || {}

    const gradeValue = currentReview.grade

    if (
      gradeValue === undefined ||
      gradeValue === '' ||
      !Number.isInteger(Number(gradeValue)) ||
      Number(gradeValue) < 0 ||
      Number(gradeValue) > 100
    ) {
      setError('Оценка должна быть целым числом от 0 до 100.')
      return
    }

    setReviewingId(submission.id)
    setError('')
    setSuccess('')

    try {
      const response = await fetch(
        `/api/submissions/${submission.id}/review`,
        {
          method: 'PUT',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            status,
            grade: Number(gradeValue),
            teacherComment: currentReview.teacherComment || '',
          }),
        },
      )

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))

        throw new Error(
          data.message ||
            data.detail ||
            `Не удалось сохранить проверку. HTTP ${response.status}`,
        )
      }

      const updatedSubmission = await response.json()

      setPendingSubmissions((current) =>
        current.filter(
          (item) => item.id !== submission.id,
        ),
      )

      setSuccess(
        status === 'APPROVED'
          ? 'Решение принято.'
          : 'Решение возвращено на доработку.',
      )

      setReviewData((current) => {
        const next = { ...current }
        delete next[submission.id]
        return next
      })

      console.log('Результат проверки:', updatedSubmission)
    } catch (err) {
      console.error('Ошибка проверки решения:', err)
      setError(err.message || 'Не удалось сохранить проверку.')
    } finally {
      setReviewingId(null)
    }
  }


  const getStatusLabel = (status) => {
    switch (status) {
      case 'PENDING':
        return 'Ожидает проверки'

      case 'APPROVED':
        return 'Принято'

      case 'REJECTED':
        return 'Нужна доработка'

      default:
        return status || 'Неизвестно'
    }
  }

  const formatDate = (date) => {
    if (!date) return '—'

    return new Date(date).toLocaleString('ru-RU')
  }

  if (loading) {
    return (
      <div className="tasks-section">
        <p className="tasks-message">Загрузка практических заданий...</p>
      </div>
    )
  }

  return (
    <section className="tasks-section">

      <div className="tasks-heading">
        <div>
          <span className="course-category">
            ПРАКТИЧЕСКАЯ РАБОТА
          </span>

          <h2>Практические задания</h2>

          <p>
            {isAuthor
              ? 'Создавай задания и проверяй решения учеников.'
              : 'Выполняй задания и отправляй свой код преподавателю.'}
          </p>
        </div>

        {isAuthor && (
          <button
            type="button"
            className="tasks-primary-button"
            onClick={openCreateForm}
          >
            + Создать задание
          </button>
        )}
      </div>

      {error && (
        <div className="tasks-alert tasks-alert-error" role="alert">
          {error}
        </div>
      )}

      {success && (
        <div className="tasks-alert tasks-alert-success" role="status">
          {success}
        </div>
      )}

      {/* ================================= */}
      {/* ФОРМА СОЗДАНИЯ / РЕДАКТИРОВАНИЯ */}
      {/* ================================= */}

      {isAuthor && showTaskForm && (
        <form
          className="task-form"
          onSubmit={handleSaveTask}
        >
          <h3>
            {editingTaskId
              ? 'Редактирование задания'
              : 'Новое практическое задание'}
          </h3>

          <label>
            Название задания *
            <input
              type="text"
              name="title"
              value={taskForm.title}
              onChange={handleTaskFormChange}
              maxLength={150}
              placeholder="Например: Сумма двух чисел"
              required
            />
          </label>

          <label>
            Условие задания *
            <textarea
              name="description"
              value={taskForm.description}
              onChange={handleTaskFormChange}
              placeholder="Подробно опиши, что должен сделать ученик..."
              rows={6}
              required
            />
          </label>

          <label>
            Входные данные
            <textarea
              name="inputDescription"
              value={taskForm.inputDescription}
              onChange={handleTaskFormChange}
              placeholder="Опиши формат входных данных..."
              rows={3}
            />
          </label>

          <label>
            Выходные данные
            <textarea
              name="outputDescription"
              value={taskForm.outputDescription}
              onChange={handleTaskFormChange}
              placeholder="Опиши, что программа должна вывести..."
              rows={3}
            />
          </label>

          <label>
            Примеры
            <textarea
              name="examples"
              value={taskForm.examples}
              onChange={handleTaskFormChange}
              placeholder={'Входные данные:\n2 3\n\nВыходные данные:\n5'}
              rows={5}
            />
          </label>

          <label>
            Язык программирования
            <select
              name="programmingLanguage"
              value={taskForm.programmingLanguage}
              onChange={handleTaskFormChange}
            >
              <option value="Java">Java</option>
              <option value="C++">C++</option>
              <option value="Python">Python</option>
              <option value="JavaScript">JavaScript</option>
              <option value="C#">C#</option>
            </select>
          </label>

          <label>
            Начальный код (необязательно)
            <textarea
              className="task-code-editor"
              name="starterCode"
              value={taskForm.starterCode}
              onChange={handleTaskFormChange}
              placeholder="Можешь добавить заготовку программы..."
              rows={8}
              spellCheck="false"
            />
          </label>

          <div className="task-form-actions">
            <button
              type="submit"
              className="tasks-primary-button"
              disabled={savingTask}
            >
              {savingTask
                ? 'Сохранение...'
                : editingTaskId
                  ? 'Сохранить изменения'
                  : 'Создать задание'}
            </button>

            <button
              type="button"
              className="tasks-secondary-button"
              onClick={() => {
                setShowTaskForm(false)
                setEditingTaskId(null)
                setTaskForm(EMPTY_TASK)
              }}
              disabled={savingTask}
            >
              Отмена
            </button>
          </div>
        </form>
      )}

      {/* ================================= */}
      {/* СПИСОК ЗАДАНИЙ */}
      {/* ================================= */}

      {tasks.length === 0 && !showTaskForm && (
        <div className="tasks-empty">
          <h3>Пока нет практических заданий</h3>

          <p>
            {isAuthor
              ? 'Создай первое задание для учеников.'
              : 'Преподаватель пока не добавил задания к этому уроку.'}
          </p>
        </div>
      )}

      <div className="tasks-list">
        {tasks.map((task, index) => {
          const submissions = submissionsByTask[task.id] || []

          const latestSubmission = submissions[0]

          const taskPendingSubmissions = pendingSubmissions.filter(
            (submission) =>
              Number(submission.taskId) === Number(task.id),
          )

          return (
            <article className="programming-task-card" key={task.id}>

              <div className="programming-task-header">
                <div>
                  <span className="task-number">
                    ЗАДАНИЕ {index + 1}
                  </span>

                  <h3>{task.title}</h3>
                </div>

                <span className="task-language">
                  {task.programmingLanguage}
                </span>
              </div>

              {/* УСЛОВИЕ */}

              <div className="task-description">
                <h4>Условие</h4>
                <p>{task.description}</p>
              </div>

              {/* ВХОДНЫЕ ДАННЫЕ */}

              {task.inputDescription && (
                <div className="task-detail">
                  <h4>Входные данные</h4>
                  <p>{task.inputDescription}</p>
                </div>
              )}

              {/* ВЫХОДНЫЕ ДАННЫЕ */}

              {task.outputDescription && (
                <div className="task-detail">
                  <h4>Выходные данные</h4>
                  <p>{task.outputDescription}</p>
                </div>
              )}

              {/* ПРИМЕРЫ */}

              {task.examples && (
                <div className="task-detail">
                  <h4>Примеры</h4>

                  <pre className="task-example">
                    {task.examples}
                  </pre>
                </div>
              )}

              {/* =========================== */}
              {/* ИНТЕРФЕЙС АВТОРА */}
              {/* =========================== */}

              {isAuthor && (
                <div className="task-author-actions">
                  <button
                    type="button"
                    className="tasks-secondary-button"
                    onClick={() => openEditForm(task)}
                  >
                    Редактировать
                  </button>

                  <button
                    type="button"
                    className="tasks-danger-button"
                    onClick={() => handleDeleteTask(task)}
                  >
                    Удалить
                  </button>
                </div>
              )}

              {/* =========================== */}
              {/* ИНТЕРФЕЙС УЧЕНИКА */}
              {/* =========================== */}

              {!isAuthor && (
                <div className="task-solution-section">
                  <h4>Твоё решение</h4>

                  {!user && (
                    <p className="tasks-message">
                      Войди в аккаунт, чтобы отправить решение.
                    </p>
                  )}

                  {user && (
                    <>
                      <textarea
                        className="task-code-editor"
                        value={
                          codeByTask[task.id] ??
                          task.starterCode ??
                          ''
                        }
                        onChange={(event) =>
                          handleCodeChange(task.id, event.target.value)
                        }
                        placeholder="Напиши здесь код своей программы..."
                        spellCheck="false"
                        rows={12}
                      />

                      <div className="task-submit-actions">
                        <button
                          type="button"
                          className="tasks-primary-button"
                          onClick={() => handleSubmitCode(task)}
                          disabled={submittingTaskId === task.id}
                        >
                          {submittingTaskId === task.id
                            ? 'Отправка...'
                            : 'Отправить решение'}
                        </button>
                      </div>

                      {/* ПОСЛЕДНЯЯ ПОПЫТКА */}

                      {latestSubmission && (
                        <div className="task-last-submission">
                          <h4>Последняя отправка</h4>

                          <div className="submission-info">
                            <span
                              className={`submission-status submission-status-${latestSubmission.status?.toLowerCase()}`}
                            >
                              {getStatusLabel(latestSubmission.status)}
                            </span>

                            <span>
                              {formatDate(latestSubmission.submittedAt)}
                            </span>
                          </div>

                          {latestSubmission.grade !== null &&
                            latestSubmission.grade !== undefined && (
                              <p>
                                Оценка: <strong>{latestSubmission.grade}/100</strong>
                              </p>
                            )}

                          {latestSubmission.teacherComment && (
                            <div className="teacher-comment">
                              <strong>Комментарий преподавателя:</strong>
                              <p>{latestSubmission.teacherComment}</p>
                            </div>
                          )}
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}

              {/* =========================== */}
              {/* ПРОВЕРКА РЕШЕНИЙ АВТОРОМ */}
              {/* =========================== */}

              {isAuthor && taskPendingSubmissions.length > 0 && (
                <div className="task-review-section">
                  <h4>
                    Решения на проверку ({taskPendingSubmissions.length})
                  </h4>

                  {taskPendingSubmissions.map((submission) => {
                    const review = reviewData[submission.id] || {}

                    return (
                      <div
                        className="task-submission-card"
                        key={submission.id}
                      >
                        <div className="submission-info">
                          <strong>
                            Ученик: {submission.studentUsername}
                          </strong>

                          <span>
                            {formatDate(submission.submittedAt)}
                          </span>
                        </div>

                        <div className="submission-code-block">
                          <div className="submission-code-heading">
                            Код ученика
                          </div>

                          <pre>{submission.submittedCode}</pre>
                        </div>

                        <label>
                          Оценка (от 0 до 100)
                          <input
                            type="number"
                            min="0"
                            max="100"
                            step="1"
                            value={review.grade ?? ''}
                            onChange={(event) =>
                              handleReviewChange(
                                submission.id,
                                'grade',
                                event.target.value,
                              )
                            }
                            placeholder="Например, 90"
                          />
                        </label>

                        <label>
                          Комментарий преподавателя
                          <textarea
                            value={review.teacherComment ?? ''}
                            onChange={(event) =>
                              handleReviewChange(
                                submission.id,
                                'teacherComment',
                                event.target.value,
                              )
                            }
                            placeholder="Напиши замечания или объясни, что нужно исправить..."
                            rows={3}
                          />
                        </label>

                        <div className="task-review-actions">
                          <button
                            type="button"
                            className="tasks-primary-button"
                            disabled={reviewingId === submission.id}
                            onClick={() =>
                              handleReviewSubmission(
                                submission,
                                'APPROVED',
                              )
                            }
                          >
                            Принять решение
                          </button>

                          <button
                            type="button"
                            className="tasks-danger-button"
                            disabled={reviewingId === submission.id}
                            onClick={() =>
                              handleReviewSubmission(
                                submission,
                                'REJECTED',
                              )
                            }
                          >
                            Вернуть на доработку
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}

              {isAuthor && taskPendingSubmissions.length === 0 && (
                <p className="tasks-message">
                  Пока нет решений, ожидающих проверки.
                </p>
              )}

            </article>
          )
        })}
      </div>

      {/* ОБНОВЛЕНИЕ СПИСКОВ */}

      {isAuthor && tasks.length > 0 && (
        <button
          type="button"
          className="tasks-secondary-button tasks-refresh-button"
          onClick={loadPendingSubmissions}
        >
          Обновить решения учеников
        </button>
      )}

      {!isAuthor && user && tasks.length > 0 && (
        <button
          type="button"
          className="tasks-secondary-button tasks-refresh-button"
          onClick={() => loadMySubmissions(tasks)}
        >
          Обновить мои решения
        </button>
      )}

    </section>
  )
}

export default ProgrammingTaskSection
