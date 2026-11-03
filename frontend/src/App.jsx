import { useState, useEffect } from 'react'
import './App.css'

import Header from './components/Header'
import AuthForm from './components/AuthForm'

import CourseList from './components/CourseList'
import CourseForm from './components/CourseForm'

import LessonList from './components/LessonList'
import LessonForm from './components/LessonForm'

import TestSection from './components/tests/TestSection'
import ProgrammingTaskSection from './components/tasks/ProgrammingTaskSection'

import StudentProfile from './components/StudentProfile'

function App() {
  const [courses, setCourses] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [user, setUser] = useState(null)
  const [authMode, setAuthMode] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [authError, setAuthError] = useState('')
  const [authLoading, setAuthLoading] = useState(false)

  const [page, setPage] = useState('home')
  const [courseReturnPage, setCourseReturnPage] = useState('home')

  const [enrolledCourses, setEnrolledCourses] = useState([])
  const [enrollmentLoading, setEnrollmentLoading] = useState(null)
  const [enrollmentError, setEnrollmentError] = useState('')

  const [courseTitle, setCourseTitle] = useState('')
  const [courseDescription, setCourseDescription] = useState('')
  const [courseFormError, setCourseFormError] = useState('')
  const [courseFormLoading, setCourseFormLoading] = useState(false)
  const [editingCourse, setEditingCourse] = useState(null)
  const [courseDeleteLoading, setCourseDeleteLoading] = useState(null)

  const [selectedCourse, setSelectedCourse] = useState(null)
  const [lessons, setLessons] = useState([])
  const [selectedLesson, setSelectedLesson] = useState(null)
  const [detailsLoading, setDetailsLoading] = useState(false)
  const [detailsError, setDetailsError] = useState('')

  const [lessonTab, setLessonTab] = useState('theory')

  const [editingLesson, setEditingLesson] = useState(null)
  const [lessonTitle, setLessonTitle] = useState('')
  const [lessonContent, setLessonContent] = useState('')
  const [lessonPosition, setLessonPosition] = useState('1')
  const [lessonFormError, setLessonFormError] = useState('')
  const [lessonFormLoading, setLessonFormLoading] = useState(false)
  const [lessonDeleteLoading, setLessonDeleteLoading] = useState(null)

  const [lessonProgress, setLessonProgress] = useState(null)
  const [progressLoading, setProgressLoading] = useState(false)
  const [progressError, setProgressError] = useState('')

  const isCourseAuthor = (course) => {
    return (
      user != null &&
      user.id != null &&
      course?.authorId != null &&
      Number(course.authorId) === Number(user.id)
    )
  }

  const isEnrolledInCourse = (course) => {
    if (!user || !course) {
      return false
    }

    return enrolledCourses.some(
      (enrolledCourse) =>
        Number(enrolledCourse.id) === Number(course.id),
    )
  }

  const canStudyCourse = (course) => {
    return (
      isCourseAuthor(course) ||
      isEnrolledInCourse(course)
    )
  }

  const refreshCurrentUser = async () => {
    try {
      const response = await fetch('/api/auth/me', {
        credentials: 'include',
      })

      if (!response.ok) {
        return null
      }

      const data = await response.json()
      setUser(data)

      return data
    } catch (err) {
      console.error('Ошибка обновления пользователя:', err)
      return null
    }
  }

  const loadCourses = async () => {
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/courses', {
        credentials: 'include',
      })

      if (!response.ok) {
        throw new Error('Не удалось загрузить курсы')
      }

      const data = await response.json()
      setCourses(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('Ошибка загрузки курсов:', err)

      setError(
        'Не удалось подключиться к серверу. Проверь, запущен ли Spring Boot.',
      )
    } finally {
      setLoading(false)
    }
  }

  const loadMyCourses = async () => {
    if (!user?.id) {
      setEnrolledCourses([])
      return
    }

    try {
      const response = await fetch('/api/courses/my', {
        credentials: 'include',
      })

      if (!response.ok) {
        throw new Error(
          `Не удалось загрузить записанные курсы. HTTP ${response.status}`,
        )
      }

      const data = await response.json()

      setEnrolledCourses(Array.isArray(data) ? data : [])
      setEnrollmentError('')
    } catch (err) {
      console.error('Ошибка загрузки записанных курсов:', err)

      setEnrollmentError(
        err.message || 'Не удалось загрузить записанные курсы.',
      )
    }
  }

  const handleEnroll = async (courseId) => {
    if (!user) {
      openAuth('login')
      return
    }

    setEnrollmentLoading(courseId)
    setEnrollmentError('')

    try {
      const response = await fetch(
        `/api/courses/${courseId}/enroll`,
        {
          method: 'POST',
          credentials: 'include',
        },
      )

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))

        throw new Error(
          data.message ||
            data.detail ||
            `Не удалось записаться на курс. HTTP ${response.status}`,
        )
      }

      await loadMyCourses()
    } catch (err) {
      console.error('Ошибка записи на курс:', err)

      setEnrollmentError(
        err.message || 'Не удалось записаться на курс.',
      )
    } finally {
      setEnrollmentLoading(null)
    }
  }

  const handleUnenroll = async (courseId) => {
    if (!user) {
      openAuth('login')
      return
    }

    const course = courses.find(
      (item) => Number(item.id) === Number(courseId),
    )

    const confirmed = window.confirm(
      `Ты действительно хочешь отписаться от курса «${course?.title || 'Без названия'}»?\n\nТвой прогресс по этому курсу будет удалён.`,
    )

    if (!confirmed) {
      return
    }

    setEnrollmentLoading(courseId)
    setEnrollmentError('')

    try {
      const response = await fetch(
        `/api/courses/${courseId}/enroll`,
        {
          method: 'DELETE',
          credentials: 'include',
        },
      )

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))

        throw new Error(
          data.message ||
            data.detail ||
            `Не удалось отписаться от курса. HTTP ${response.status}`,
        )
      }

      await loadMyCourses()

      if (
        selectedCourse &&
        Number(selectedCourse.id) === Number(courseId)
      ) {
        goHome()
      }
    } catch (err) {
      console.error('Ошибка отписки от курса:', err)

      setEnrollmentError(
        err.message || 'Не удалось отписаться от курса.',
      )
    } finally {
      setEnrollmentLoading(null)
    }
  }

  const goHome = () => {
    setPage('home')

    setEditingCourse(null)
    setEditingLesson(null)

    setSelectedCourse(null)
    setLessons([])
    setSelectedLesson(null)
    setLessonTab('theory')

    setDetailsError('')
    setLessonProgress(null)
    setProgressError('')

    setCourseFormError('')
    setLessonFormError('')
    setError('')
  }

  const openStudentProfile = () => {
    if (!user) {
      openAuth('login')
      return
    }

    setPage('profile')
  }

  const openCreateCourse = () => {
    if (!user) {
      openAuth('login')
      return
    }

    setCourseReturnPage(page)
    setEditingCourse(null)
    setCourseTitle('')
    setCourseDescription('')
    setCourseFormError('')

    setPage('create-course')
  }

  const openEditCourse = (course) => {
    if (!isCourseAuthor(course)) {
      setError('Редактировать можно только собственные курсы.')
      return
    }

    setCourseReturnPage(page)
    setError('')
    setEditingCourse(course)
    setCourseTitle(course.title || '')
    setCourseDescription(course.description || '')
    setCourseFormError('')

    setPage('create-course')
  }

  const closeCourseForm = () => {
    setEditingCourse(null)
    setCourseFormError('')
    setPage(courseReturnPage)
  }

  const handleCreateCourse = async (event) => {
    event.preventDefault()
    setCourseFormError('')

    if (!user || user.id == null) {
      setCourseFormError('Не удалось определить пользователя.')
      return
    }

    if (!courseTitle.trim()) {
      setCourseFormError('Введи название курса.')
      return
    }

    if (editingCourse && !isCourseAuthor(editingCourse)) {
      setCourseFormError('Можно редактировать только собственные курсы.')
      return
    }

    setCourseFormLoading(true)

    try {
      const isEditing = Boolean(editingCourse)

      const response = await fetch(
        isEditing
          ? `/api/courses/${editingCourse.id}`
          : '/api/courses',
        {
          method: isEditing ? 'PUT' : 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title: courseTitle.trim(),
            description: courseDescription.trim(),
          }),
        },
      )

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))

        throw new Error(
          data.message ||
            data.detail ||
            `Не удалось сохранить курс. HTTP ${response.status}`,
        )
      }

      await loadCourses()
      await refreshCurrentUser()

      setEditingCourse(null)
      setCourseFormError('')
      setPage(courseReturnPage)
    } catch (err) {
      console.error('Ошибка сохранения курса:', err)
      setCourseFormError(err.message || 'Не удалось сохранить курс.')
    } finally {
      setCourseFormLoading(false)
    }
  }

  const handleDeleteCourse = async (courseOrId) => {
    const course =
      typeof courseOrId === 'object'
        ? courseOrId
        : courses.find(
            (item) => Number(item.id) === Number(courseOrId),
          )

    if (!course) {
      setError('Не удалось найти курс.')
      return
    }

    if (!isCourseAuthor(course)) {
      setError('Удалять можно только собственные курсы.')
      return
    }

    if (
      !window.confirm(
        `Удалить курс «${course.title}»? Это действие нельзя отменить.`,
      )
    ) {
      return
    }

    setCourseDeleteLoading(course.id)
    setError('')

    try {
      const response = await fetch(`/api/courses/${course.id}`, {
        method: 'DELETE',
        credentials: 'include',
      })

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))

        throw new Error(
          data.message ||
            data.detail ||
            `Не удалось удалить курс. HTTP ${response.status}`,
        )
      }

      setCourses((current) =>
        current.filter(
          (item) => Number(item.id) !== Number(course.id),
        ),
      )

      setEnrolledCourses((current) =>
        current.filter(
          (item) => Number(item.id) !== Number(course.id),
        ),
      )

      if (
        selectedCourse &&
        Number(selectedCourse.id) === Number(course.id)
      ) {
        goHome()
      }
    } catch (err) {
      console.error('Ошибка удаления курса:', err)
      setError(err.message || 'Не удалось удалить курс.')
    } finally {
      setCourseDeleteLoading(null)
    }
  }

  useEffect(() => {
    loadCourses()
  }, [])


  useEffect(() => {
    refreshCurrentUser()
  }, [])

  useEffect(() => {
    if (user?.id) {
      loadMyCourses()
    } else {
      setEnrolledCourses([])
      setEnrollmentError('')
    }
  }, [user?.id])

  const filteredCourses = courses.filter((course) =>
    (course.title || '')
      .toLowerCase()
      .includes(search.toLowerCase()),
  )

  const openAuth = (mode) => {
    setAuthMode(mode)
    setUsername('')
    setPassword('')
    setAuthError('')
  }

  const handleAuthSubmit = async (event) => {
    event.preventDefault()
    setAuthError('')
    setAuthLoading(true)

    try {
      if (authMode === 'register') {
        const registerResponse = await fetch('/api/auth/register', {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            username,
            password,
          }),
        })

        if (!registerResponse.ok) {
          const data = await registerResponse.json().catch(() => ({}))

          throw new Error(
            data.detail ||
              data.message ||
              (registerResponse.status === 409
                ? 'Такой логин уже существует.'
                : 'Не удалось зарегистрироваться.'),
          )
        }
      }

      const loginResponse = await fetch('/api/auth/login', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          password,
        }),
      })

      if (!loginResponse.ok) {
        const data = await loginResponse.json().catch(() => ({}))

        throw new Error(
          data.detail ||
            data.message ||
            'Не удалось войти. Проверь логин и пароль.',
        )
      }

      const loggedInUser = await loginResponse.json()

      setUser(loggedInUser)
      setAuthMode('')
      setUsername('')
      setPassword('')

      if (loggedInUser.id == null) {
        await refreshCurrentUser()
      }
    } catch (err) {
      setAuthError(err.message || 'Произошла ошибка. Попробуй ещё раз.')
    } finally {
      setAuthLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      })

      if (!response.ok) {
        throw new Error('Не удалось завершить сессию')
      }

      setUser(null)
      setAuthError('')
      setLessonProgress(null)
      setProgressError('')

      setEnrolledCourses([])
      setEnrollmentError('')
      setEnrollmentLoading(null)

      goHome()
    } catch (err) {
      console.error('Ошибка выхода:', err)
      setAuthError('Не удалось выйти. Попробуй ещё раз.')
    }
  }

  const handleOpenCourse = async (courseId) => {
    setPage('course')

    setSelectedCourse(null)
    setLessons([])
    setSelectedLesson(null)
    setLessonTab('theory')

    setLessonProgress(null)
    setProgressError('')
    setDetailsError('')
    setDetailsLoading(true)

    try {
      const [courseResponse, lessonsResponse] = await Promise.all([
        fetch(`/api/courses/${courseId}`, {
          credentials: 'include',
        }),
        fetch(`/api/courses/${courseId}/lessons`, {
          credentials: 'include',
        }),
      ])

      if (!courseResponse.ok) {
        throw new Error('Не удалось загрузить информацию о курсе.')
      }

      if (!lessonsResponse.ok) {
        throw new Error('Не удалось загрузить уроки курса.')
      }

      const courseData = await courseResponse.json()
      const lessonsData = await lessonsResponse.json()

      setSelectedCourse(courseData)

      setLessons(
        [...lessonsData].sort(
          (a, b) => Number(a.position) - Number(b.position),
        ),
      )
    } catch (err) {
      console.error('Ошибка загрузки курса:', err)
      setDetailsError(err.message || 'Не удалось загрузить курс.')
    } finally {
      setDetailsLoading(false)
    }
  }

  const reloadLessons = async () => {
    if (!selectedCourse) return

    const response = await fetch(
      `/api/courses/${selectedCourse.id}/lessons`,
      {
        credentials: 'include',
      },
    )

    if (!response.ok) {
      throw new Error('Не удалось обновить список уроков.')
    }

    const data = await response.json()

    setLessons(
      [...data].sort(
        (a, b) => Number(a.position) - Number(b.position),
      ),
    )
  }

  const openCreateLesson = () => {
    if (!isCourseAuthor(selectedCourse)) {
      setDetailsError('Создавать уроки может только автор курса.')
      return
    }

    setEditingLesson(null)
    setLessonTitle('')
    setLessonContent('')
    setLessonPosition(String(lessons.length + 1))
    setLessonFormError('')

    setPage('create-lesson')
  }

  const openEditLesson = (lesson) => {
    if (!isCourseAuthor(selectedCourse)) {
      setDetailsError('Редактировать уроки может только автор курса.')
      return
    }

    setEditingLesson(lesson)
    setLessonTitle(lesson.title || '')
    setLessonContent(lesson.content || '')
    setLessonPosition(String(lesson.position ?? 1))
    setLessonFormError('')

    setPage('create-lesson')
  }

  const handleSaveLesson = async (event) => {
    event.preventDefault()
    setLessonFormError('')

    if (!selectedCourse || !isCourseAuthor(selectedCourse)) {
      setLessonFormError('Управлять уроками может только автор курса.')
      return
    }

    if (!lessonTitle.trim()) {
      setLessonFormError('Введи название урока.')
      return
    }

    if (!lessonContent.trim()) {
      setLessonFormError('Введи содержание урока.')
      return
    }

    const position = Number(lessonPosition)

    if (!Number.isInteger(position) || position < 1) {
      setLessonFormError('Позиция урока должна быть целым числом от 1.')
      return
    }

    setLessonFormLoading(true)

    try {
      const isEditing = Boolean(editingLesson)

      const url = isEditing
        ? `/api/lessons/${editingLesson.id}`
        : `/api/courses/${selectedCourse.id}/lessons`

      const response = await fetch(url, {
        method: isEditing ? 'PUT' : 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: lessonTitle.trim(),
          content: lessonContent.trim(),
          position,
        }),
      })

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))

        throw new Error(
          data.message ||
            data.detail ||
            `Не удалось сохранить урок. HTTP ${response.status}`,
        )
      }

      await reloadLessons()
      await loadCourses()

      setEditingLesson(null)
      setPage('course')
    } catch (err) {
      console.error('Ошибка сохранения урока:', err)
      setLessonFormError(err.message || 'Не удалось сохранить урок.')
    } finally {
      setLessonFormLoading(false)
    }
  }

  const handleDeleteLesson = async (lesson) => {
    if (!isCourseAuthor(selectedCourse)) {
      setDetailsError('Удалять уроки может только автор курса.')
      return
    }

    if (!window.confirm(`Удалить урок «${lesson.title}»?`)) {
      return
    }

    setLessonDeleteLoading(lesson.id)
    setDetailsError('')

    try {
      const response = await fetch(`/api/lessons/${lesson.id}`, {
        method: 'DELETE',
        credentials: 'include',
      })

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))

        throw new Error(
          data.message ||
            data.detail ||
            `Не удалось удалить урок. HTTP ${response.status}`,
        )
      }

      setLessons((current) =>
        current.filter(
          (item) => Number(item.id) !== Number(lesson.id),
        ),
      )

      await loadCourses()

      if (
        selectedLesson &&
        Number(selectedLesson.id) === Number(lesson.id)
      ) {
        setSelectedLesson(null)
        setLessonProgress(null)
        setLessonTab('theory')
        setPage('course')
      }
    } catch (err) {
      console.error('Ошибка удаления урока:', err)
      setDetailsError(err.message || 'Не удалось удалить урок.')
    } finally {
      setLessonDeleteLoading(null)
    }
  }

  const loadLessonProgress = async (lessonId) => {
    setLessonProgress(null)
    setProgressError('')

    if (!user) return

    if (user.id == null) {
      setProgressError('Не удалось определить ID пользователя.')
      return
    }

    setProgressLoading(true)

    try {
      const response = await fetch(`/api/progress/${user.id}`, {
        credentials: 'include',
      })

      if (!response.ok) {
        throw new Error(
          `Не удалось загрузить прогресс: HTTP ${response.status}`,
        )
      }

      const data = await response.json()
      const progressList = Array.isArray(data) ? data : []

      const currentProgress = progressList.find(
        (item) => Number(item.lessonId) === Number(lessonId),
      )

      setLessonProgress(currentProgress || null)
    } catch (err) {
      console.error('Ошибка загрузки прогресса:', err)

      setProgressError(
        err.message || 'Не удалось загрузить прогресс урока.',
      )
    } finally {
      setProgressLoading(false)
    }
  }

  const handleOpenLesson = async (lesson) => {
    if (!canStudyCourse(selectedCourse)) {
      setDetailsError(
        'Чтобы изучать уроки, сначала запишись на этот курс.',
      )
      return
    }

    setSelectedLesson(lesson)

    setLessonTab('theory')

    setPage('lesson')

    setLessonProgress(null)
    setProgressError('')

    await loadLessonProgress(lesson.id)
  }

  const updateLessonProgress = async (action) => {
    if (!user) {
      setProgressError(
        'Войди в аккаунт, чтобы сохранять прогресс обучения.',
      )
      return
    }

    if (!selectedCourse || !canStudyCourse(selectedCourse)) {
      setProgressError(
        'Чтобы сохранять прогресс, необходимо записаться на курс.',
      )
      return
    }

    if (user.id == null || !selectedLesson) {
      setProgressError('Не удалось определить пользователя или урок.')
      return
    }

    setProgressLoading(true)
    setProgressError('')

    try {
      const response = await fetch(
        `/api/progress/${user.id}/lessons/${selectedLesson.id}/${action}`,
        {
          method: 'POST',
          credentials: 'include',
        },
      )

      if (!response.ok) {
        throw new Error(
          `Не удалось сохранить прогресс: HTTP ${response.status}`,
        )
      }

      setLessonProgress(await response.json())
    } catch (err) {
      console.error('Ошибка сохранения прогресса:', err)

      setProgressError(
        err.message || 'Не удалось сохранить прогресс урока.',
      )
    } finally {
      setProgressLoading(false)
    }
  }

  const getProgressLabel = (status) => {
    switch (status) {
      case 'NOT_STARTED':
        return 'Не начат'

      case 'IN_PROGRESS':
        return 'В процессе'

      case 'COMPLETED':
        return 'Завершён'

      default:
        return 'Не начат'
    }
  }

  return (
    <div className="app">

      <Header
        user={user}
        onGoHome={goHome}
        onOpenAuth={openAuth}
        onLogout={handleLogout}
        onCreateCourse={openCreateCourse}
        onOpenProfile={openStudentProfile}
      />

      <main>

        {page === 'home' && (
          <>
            <section className="hero" id="home">
              <div className="hero-content">
                <span className="hero-label">
                  ПЛАТФОРМА ДЛЯ ОБУЧЕНИЯ
                </span>

                <h1>
                  Твои знания —
                  <br />
                  <span>твоё будущее</span>
                </h1>

                <p className="hero-description">
                  Изучай программирование и информатику,
                  развивай навыки и двигайся к своим целям
                  вместе с OnlineSchool.
                </p>

                <a className="hero-button" href="#courses">
                  Смотреть курсы <span>→</span>
                </a>

                <div className="hero-stats">
                  <div>
                    <strong>{courses.length}</strong>
                    <span>Учебных курсов</span>
                  </div>

                  <div>
                    <strong>24/7</strong>
                    <span>Доступ к обучению</span>
                  </div>
                </div>
              </div>

              <div className="hero-illustration">
                <div className="floating-card floating-card-top">
                  <span>✓</span> Обучение доступно
                </div>

                <div className="laptop">
                  <div className="laptop-screen">
                    <div className="code-dots">
                      <i></i>
                      <i></i>
                      <i></i>
                    </div>

                    <div className="code-line short"></div>
                    <div className="code-line"></div>
                    <div className="code-line medium"></div>
                    <div className="code-line short"></div>
                    <div className="code-line long"></div>
                    <div className="code-line medium"></div>
                    <div className="code-line short"></div>
                    <div className="code-line"></div>
                  </div>

                  <div className="laptop-base"></div>
                </div>

                <div className="floating-card floating-card-bottom">
                  <span>✦</span> Учись в своём темпе
                </div>
              </div>
            </section>

            <CourseList
              courses={courses}
              filteredCourses={filteredCourses}
              search={search}
              loading={loading}
              error={error}
              user={user}
              isCourseAuthor={isCourseAuthor}
              courseDeleteLoading={courseDeleteLoading}
              enrolledCourseIds={enrolledCourses.map((course) =>
                Number(course.id),
              )}
              onEnroll={handleEnroll}
              onUnenroll={handleUnenroll}
              enrollmentLoading={enrollmentLoading}
              enrollmentError={enrollmentError}
              onSearchChange={setSearch}
              onOpenCourse={handleOpenCourse}
              onEditCourse={openEditCourse}
              onDeleteCourse={handleDeleteCourse}
            />

            <section className="about-section" id="about">
              <div>
                <span className="section-label">НАША ЦЕЛЬ</span>
                <h2>Учиться проще, когда есть план</h2>
              </div>

              <p>
                OnlineSchool — учебная платформа, где можно
                изучать материалы, проходить задания, выполнять
                тесты и отслеживать свой прогресс.
              </p>
            </section>
          </>
        )}

        {page === 'profile' && user && (
          <StudentProfile
            user={user}
            onBack={goHome}
            onOpenCourse={handleOpenCourse}
            onCreateCourse={openCreateCourse}
            onEditCourse={openEditCourse}
            onDeleteCourse={handleDeleteCourse}
          />
        )}

        {page === 'create-course' && (
          <CourseForm
            editingCourse={editingCourse}
            courseTitle={courseTitle}
            courseDescription={courseDescription}
            courseFormError={courseFormError}
            courseFormLoading={courseFormLoading}
            onTitleChange={setCourseTitle}
            onDescriptionChange={setCourseDescription}
            onSubmit={handleCreateCourse}
            onBack={closeCourseForm}
          />
        )}

        {page === 'course' && (
          <LessonList
            course={selectedCourse}
            lessons={lessons}
            loading={detailsLoading}
            error={detailsError}
            isCourseAuthor={isCourseAuthor(selectedCourse)}
            isEnrolled={canStudyCourse(selectedCourse)}
            onEnroll={() => {
              if (selectedCourse) {
                handleEnroll(selectedCourse.id)
              }
            }}
            enrollmentLoading={
              enrollmentLoading === selectedCourse?.id
            }
            enrollmentError={enrollmentError}
            lessonDeleteLoading={lessonDeleteLoading}
            onOpenLesson={handleOpenLesson}
            onCreateLesson={openCreateLesson}
            onEditLesson={openEditLesson}
            onDeleteLesson={handleDeleteLesson}
            onEditCourse={openEditCourse}
            onDeleteCourse={handleDeleteCourse}
            courseDeleteLoading={courseDeleteLoading}
            onBack={goHome}
          />
        )}

        {page === 'create-lesson' && (
          <LessonForm
            editingLesson={editingLesson}
            courseTitle={selectedCourse?.title || ''}
            lessonTitle={lessonTitle}
            lessonPosition={lessonPosition}
            lessonContent={lessonContent}
            lessonFormError={lessonFormError}
            lessonFormLoading={lessonFormLoading}
            onTitleChange={setLessonTitle}
            onPositionChange={setLessonPosition}
            onContentChange={setLessonContent}
            onSubmit={handleSaveLesson}
            onBack={() => {
              setEditingLesson(null)
              setLessonFormError('')
              setPage('course')
            }}
          />
        )}

        {page === 'lesson' && (
          <section className="courses-section lesson-section">

            <button
              className="login-button"
              type="button"
              onClick={() => {
                setPage('course')
                setLessonProgress(null)
                setProgressError('')
                setLessonTab('theory')
              }}
            >
              ← Назад к урокам
            </button>

            {selectedLesson && (
              <article className="course-card lesson-card">

                <span className="course-category">
                  УРОК {selectedLesson.position}
                </span>

                <h2>{selectedLesson.title}</h2>

                <div className="lesson-tabs">
                  <button
                    type="button"
                    className={`lesson-tab ${
                      lessonTab === 'theory'
                        ? 'lesson-tab-active'
                        : ''
                    }`}
                    onClick={() => setLessonTab('theory')}
                  >
                    Теория и тесты
                  </button>

                  <button
                    type="button"
                    className={`lesson-tab ${
                      lessonTab === 'practice'
                        ? 'lesson-tab-active'
                        : ''
                    }`}
                    onClick={() => setLessonTab('practice')}
                  >
                    Практические задания
                  </button>
                </div>

                {lessonTab === 'theory' && (
                  <div className="lesson-tab-content">

                    <p className="lesson-content">
                      {selectedLesson.content}
                    </p>

                    {isCourseAuthor(selectedCourse) && (
                      <div className="course-management-actions">
                        <button
                          className="login-button"
                          type="button"
                          onClick={() => openEditLesson(selectedLesson)}
                        >
                          Редактировать урок
                        </button>

                        <button
                          className="login-button"
                          type="button"
                          onClick={() =>
                            handleDeleteLesson(selectedLesson)
                          }
                          disabled={
                            lessonDeleteLoading === selectedLesson.id
                          }
                        >
                          {lessonDeleteLoading === selectedLesson.id
                            ? 'Удаление...'
                            : 'Удалить урок'}
                        </button>
                      </div>
                    )}

                    <div className="lesson-progress">
                      <span className="course-category">
                        МОЁ ОБУЧЕНИЕ
                      </span>

                      <div className="lesson-progress-heading">
                        <h3>Прогресс урока</h3>

                        {user && !progressLoading && (
                          <span
                            className={`progress-status ${
                              lessonProgress?.status === 'COMPLETED'
                                ? 'progress-status-completed'
                                : lessonProgress?.status === 'IN_PROGRESS'
                                  ? 'progress-status-active'
                                  : ''
                            }`}
                          >
                            {getProgressLabel(lessonProgress?.status)}
                          </span>
                        )}
                      </div>

                      {!user && (
                        <p>
                          Войди в аккаунт, чтобы сохранять прогресс обучения.
                        </p>
                      )}

                      {user && progressLoading && (
                        <p>Загрузка прогресса...</p>
                      )}

                      {user && !progressLoading && !progressError && (
                        <p>
                          {lessonProgress?.status === 'COMPLETED'
                            ? 'Отлично! Этот урок завершён.'
                            : lessonProgress?.status === 'IN_PROGRESS'
                              ? 'Ты уже начал этот урок. Продолжай обучение!'
                              : 'Начни урок и отметь его завершение, когда закончишь.'}
                        </p>
                      )}

                      {progressError && (
                        <p className="auth-error" role="alert">
                          {progressError}
                        </p>
                      )}

                      {user && (
                        <div className="lesson-progress-actions">
                          <button
                            className="login-button"
                            type="button"
                            disabled={progressLoading}
                            onClick={() => updateLessonProgress('start')}
                          >
                            {lessonProgress?.status === 'IN_PROGRESS'
                              ? 'Продолжить урок'
                              : lessonProgress?.status === 'COMPLETED'
                                ? 'Пройти ещё раз'
                                : 'Начать урок'}
                          </button>

                          <button
                            className="register-button"
                            type="button"
                            disabled={
                              progressLoading ||
                              lessonProgress?.status === 'COMPLETED'
                            }
                            onClick={() =>
                              updateLessonProgress('complete')
                            }
                          >
                            {lessonProgress?.status === 'COMPLETED'
                              ? 'Урок завершён ✓'
                              : 'Завершить урок'}
                          </button>
                        </div>
                      )}
                    </div>

                    <TestSection
                      lessonId={selectedLesson.id}
                      isAuthor={isCourseAuthor(selectedCourse)}
                    />

                  </div>
                )}

                {lessonTab === 'practice' && (
                  <div className="lesson-tab-content">

                    <ProgrammingTaskSection
                      lessonId={selectedLesson.id}
                      isAuthor={isCourseAuthor(selectedCourse)}
                      user={user}
                    />

                  </div>
                )}

              </article>
            )}
          </section>
        )}

      </main>

      <footer className="footer">
        <a
          className="logo footer-logo"
          href="#home"
          onClick={goHome}
        >
          <span className="logo-icon">O</span>
          OnlineSchool
        </a>

        <p>© 2026 OnlineSchool. Учись и развивайся.</p>
      </footer>

      <AuthForm
        authMode={authMode}
        username={username}
        password={password}
        authError={authError}
        authLoading={authLoading}
        onClose={() => setAuthMode('')}
        onSubmit={handleAuthSubmit}
        onUsernameChange={setUsername}
        onPasswordChange={setPassword}
        onSwitchMode={() =>
          openAuth(authMode === 'login' ? 'register' : 'login')
        }
      />

    </div>
  )
}

export default App
