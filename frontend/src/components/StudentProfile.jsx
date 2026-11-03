import { useEffect, useState } from 'react'

function StudentProfile({
  user,
  onBack,
  onOpenCourse,
  onCreateCourse,
  onEditCourse,
  onDeleteCourse,
}) {
  const [profile, setProfile] = useState(null)
  const [enrolledCourses, setEnrolledCourses] = useState([])
  const [createdCourses, setCreatedCourses] = useState([])
  const [submissions, setSubmissions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!user?.id) {
      setError('Не удалось определить пользователя.')
      setLoading(false)
      return
    }

    const loadProfile = async () => {
      setLoading(true)
      setError('')

      try {
        const [
          profileResponse,
          enrolledResponse,
          createdResponse,
          submissionsResponse,
        ] = await Promise.all([
          fetch(`/api/progress/${user.id}/profile`, {
            credentials: 'include',
          }),
          fetch('/api/courses/my', {
            credentials: 'include',
          }),
          fetch(`/api/courses/author/${user.id}`, {
            credentials: 'include',
          }),
          fetch('/api/submissions/my', {
            credentials: 'include',
          }),
        ])

        if (!profileResponse.ok) {
          throw new Error(
            `Не удалось загрузить прогресс. HTTP ${profileResponse.status}`,
          )
        }

        if (!enrolledResponse.ok) {
          throw new Error(
            `Не удалось загрузить записанные курсы. HTTP ${enrolledResponse.status}`,
          )
        }

        if (!createdResponse.ok) {
          throw new Error(
            `Не удалось загрузить созданные курсы. HTTP ${createdResponse.status}`,
          )
        }

        if (!submissionsResponse.ok) {
          throw new Error(
            `Не удалось загрузить оценки. HTTP ${submissionsResponse.status}`,
          )
        }

        const profileData = await profileResponse.json()
        const enrolledData = await enrolledResponse.json()
        const createdData = await createdResponse.json()
        const submissionsData = await submissionsResponse.json()

        setProfile(profileData)

        setEnrolledCourses(
          Array.isArray(enrolledData) ? enrolledData : [],
        )

        setCreatedCourses(
          Array.isArray(createdData) ? createdData : [],
        )

        setSubmissions(
          Array.isArray(submissionsData) ? submissionsData : [],
        )
      } catch (err) {
        console.error('Ошибка загрузки личного кабинета:', err)

        setError(
          err.message || 'Не удалось загрузить личный кабинет.',
        )
      } finally {
        setLoading(false)
      }
    }

    loadProfile()
  }, [user?.id])

  if (loading) {
    return (
      <section className="courses-section profile-section">
        <p className="empty-message">
          Загружаем личный кабинет...
        </p>
      </section>
    )
  }

  if (error) {
    return (
      <section className="courses-section profile-section">
        <button
          className="login-button"
          onClick={onBack}
          type="button"
        >
          ← На главную
        </button>

        <p className="error-message">{error}</p>
      </section>
    )
  }

  if (!profile) return null

  const profileCourses = Array.isArray(profile.courses)
    ? profile.courses
    : []

  const progressByCourseId = new Map(
    profileCourses.map((course) => [
      Number(course.courseId),
      course,
    ]),
  )

  const learningCourses = enrolledCourses.map((course) => {
    const courseProgress = progressByCourseId.get(
      Number(course.id),
    )

    return {
      ...course,
      completedLessons: Number(
        courseProgress?.completedLessons || 0,
      ),
      totalLessons: Number(
        courseProgress?.totalLessons || 0,
      ),
      progressPercent: Number(
        courseProgress?.progressPercent || 0,
      ),
    }
  })

  const totalCourses = learningCourses.length

  const totalLessons = learningCourses.reduce(
    (sum, course) => sum + course.totalLessons,
    0,
  )

  const completedLessons = learningCourses.reduce(
    (sum, course) => sum + course.completedLessons,
    0,
  )

  const progressPercent =
    totalLessons > 0
      ? Math.round((completedLessons / totalLessons) * 100)
      : 0

  const approvedSubmissions = submissions.filter(
    (submission) =>
      submission.status === 'APPROVED' &&
      submission.grade !== null &&
      submission.grade !== undefined,
  )

  const sortedSubmissions = [...approvedSubmissions].sort(
    (a, b) =>
      new Date(b.reviewedAt || b.submittedAt) -
      new Date(a.reviewedAt || a.submittedAt),
  )

  const totalPoints = approvedSubmissions.reduce(
    (sum, submission) => sum + Number(submission.grade),
    0,
  )

  const reviewedTasks = approvedSubmissions.length

  const pendingTasks = submissions.filter(
    (submission) => submission.status === 'PENDING',
  ).length

  return (
    <section className="courses-section profile-section">

      <button
        className="login-button"
        onClick={onBack}
        type="button"
      >
        ← На главную
      </button>

      {/* ПРИВЕТСТВИЕ */}

      <div className="profile-heading">
        <span className="section-label">
          ЛИЧНЫЙ КАБИНЕТ
        </span>

        <h1>
          Привет, {profile.username || user.username}!
        </h1>

        <p>
          Здесь ты можешь следить за своими успехами,
          продолжать обучение и управлять созданными курсами.
        </p>
      </div>

      {/* ОБЩАЯ СТАТИСТИКА */}

      <div className="profile-stats">
        <article className="profile-stat-card">
          <span>Учебные курсы</span>
          <strong>{totalCourses}</strong>
        </article>

        <article className="profile-stat-card">
          <span>Всего уроков</span>
          <strong>{totalLessons}</strong>
        </article>

        <article className="profile-stat-card">
          <span>Завершено уроков</span>
          <strong>{completedLessons}</strong>
        </article>

        <article className="profile-stat-card profile-stat-highlight">
          <span>Общий прогресс</span>
          <strong>{progressPercent}%</strong>
        </article>

        <article className="profile-stat-card profile-stat-highlight">
          <span>Получено баллов</span>
          <strong>{totalPoints}</strong>
        </article>

        <article className="profile-stat-card">
          <span>Проверено заданий</span>
          <strong>{reviewedTasks}</strong>
        </article>

        <article className="profile-stat-card">
          <span>Ожидают проверки</span>
          <strong>{pendingTasks}</strong>
        </article>
      </div>

      {/* ОБЩИЙ ПРОГРЕСС */}

      <div className="profile-overall-progress">
        <div className="profile-progress-heading">
          <h2>Моё обучение</h2>
          <strong>{progressPercent}%</strong>
        </div>

        <div className="profile-progress-track">
          <div
            className="profile-progress-fill"
            style={{
              width: `${Math.min(100, Math.max(0, progressPercent))}%`,
            }}
          />
        </div>

        <p>
          Завершено {completedLessons} из {totalLessons} уроков
        </p>
      </div>

      {/* ИСТОРИЯ ОЦЕНОК */}

      <div className="profile-courses">
        <div className="section-heading">
          <div>
            <span className="section-label">
              ПРАКТИЧЕСКИЕ ЗАДАНИЯ
            </span>

            <h2>Мои результаты</h2>
          </div>
        </div>

        <div className="profile-stats">
          <article className="profile-stat-card profile-stat-highlight">
            <span>Всего получено баллов</span>
            <strong>{totalPoints}</strong>
          </article>

          <article className="profile-stat-card">
            <span>Проверено работ</span>
            <strong>{reviewedTasks}</strong>
          </article>

          <article className="profile-stat-card">
            <span>Ожидают проверки</span>
            <strong>{pendingTasks}</strong>
          </article>
        </div>

        {sortedSubmissions.length === 0 ? (
          <p className="empty-message">
            Пока нет проверенных практических заданий.
            Выполни задание и отправь его преподавателю на проверку.
          </p>
        ) : (
          <div className="profile-course-list">
            {sortedSubmissions.map((submission) => (
              <article
                className="profile-course-card"
                key={submission.id}
              >
                <div className="profile-course-info">
                  <div>
                    <span className="section-label">
                      КУРС
                    </span>

                    <h3>
                      {submission.courseTitle || 'Курс не указан'}
                    </h3>

                    <p>
                      Урок: {submission.lessonTitle || 'Урок не указан'}
                    </p>

                    <h3>
                      Задание: {submission.taskTitle || 'Практическое задание'}
                    </h3>

                    <p>
                      {submission.teacherComment ||
                        'Преподаватель не оставил комментарий.'}
                    </p>
                  </div>

                  <strong>
                    {submission.grade} / 100
                  </strong>
                </div>

                <span className="section-label">
                  Проверено преподавателем
                </span>

                {submission.reviewerUsername && (
                  <p>
                    Проверил: {submission.reviewerUsername}
                  </p>
                )}

                {submission.reviewedAt && (
                  <p>
                    Дата проверки:{' '}
                    {new Date(submission.reviewedAt).toLocaleDateString()}
                  </p>
                )}
              </article>
            ))}
          </div>
        )}
      </div>

      {/* ЗАПИСАННЫЕ КУРСЫ */}

      <div className="profile-courses">
        <div className="section-heading">
          <div>
            <span className="section-label">
              МОЁ ОБУЧЕНИЕ
            </span>

            <h2>Курсы, на которые я записан</h2>
          </div>
        </div>

        {learningCourses.length === 0 ? (
          <p className="empty-message">
            Ты пока не записался ни на один курс.
          </p>
        ) : (
          <div className="profile-course-list">
            {learningCourses.map((course) => (
              <article
                className="profile-course-card"
                key={course.id}
              >
                <div className="profile-course-info">
                  <div>
                    <h3>{course.title}</h3>

                    <p>
                      Завершено {course.completedLessons} из{' '}
                      {course.totalLessons} уроков
                    </p>
                  </div>

                  <strong>{course.progressPercent}%</strong>
                </div>

                <div className="profile-progress-track">
                  <div
                    className="profile-progress-fill"
                    style={{
                      width: `${Math.min(
                        100,
                        Math.max(0, course.progressPercent),
                      )}%`,
                    }}
                  />
                </div>

                <button
                  className="login-button"
                  type="button"
                  onClick={() => onOpenCourse(course.id)}
                >
                  Продолжить обучение →
                </button>
              </article>
            ))}
          </div>
        )}
      </div>

      {/* СОЗДАННЫЕ ПОЛЬЗОВАТЕЛЕМ КУРСЫ */}

      <div className="profile-courses">
        <div className="section-heading">
          <div>
            <span className="section-label">
              МОИ МАТЕРИАЛЫ
            </span>

            <h2>Мои созданные курсы</h2>
          </div>

          <button
            className="register-button"
            type="button"
            onClick={onCreateCourse}
          >
            + Создать курс
          </button>
        </div>

        {createdCourses.length === 0 ? (
          <p className="empty-message">
            Ты ещё не создавал курсы. Создай свой первый курс!
          </p>
        ) : (
          <div className="profile-course-list">
            {createdCourses.map((course) => (
              <article
                className="profile-course-card"
                key={course.id}
              >
                <div className="profile-course-info">
                  <div>
                    <h3>{course.title}</h3>

                    <p>
                      {course.description ||
                        'Описание курса отсутствует.'}
                    </p>
                  </div>
                </div>

                <div className="author-course-actions">
                  <button
                    className="login-button"
                    type="button"
                    onClick={() => onOpenCourse(course.id)}
                  >
                    Открыть курс
                  </button>

                  <button
                    className="login-button"
                    type="button"
                    onClick={() => onEditCourse(course)}
                  >
                    Редактировать
                  </button>

                  <button
                    className="login-button"
                    type="button"
                    onClick={() => onDeleteCourse(course)}
                  >
                    Удалить
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

    </section>
  )
}

export default StudentProfile
