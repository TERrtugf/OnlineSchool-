import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [courses, setCourses] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Загружаем курсы с Java-сервера
  useEffect(() => {
    fetch('/api/courses')
      .then((response) => {
        if (!response.ok) {
          throw new Error('Не удалось загрузить курсы')
        }

        return response.json()
      })
      .then((data) => {
        setCourses(data)
      })
      .catch((err) => {
        console.error('Ошибка загрузки курсов:', err)
        setError(
          'Не удалось подключиться к серверу. Проверь, запущен ли Spring Boot.',
        )
      })
      .finally(() => {
        setLoading(false)
      })
  }, [])

  // Поиск курсов по названию
  const filteredCourses = courses.filter((course) =>
    (course.title || '').toLowerCase().includes(search.toLowerCase()),
  )

  return (
    <div className="app">
      <header className="header">
        <a className="logo" href="#home">
          <span className="logo-icon">O</span>
          OnlineSchool
        </a>

        <nav className="navigation">
          <a href="#home">Главная</a>
          <a href="#courses">Курсы</a>
          <a href="#about">О проекте</a>
        </nav>

        <div className="header-actions">
          <button
            className="login-button"
            onClick={() => alert('Авторизацию добавим следующим этапом!')}
          >
            Войти
          </button>

          <button
            className="register-button"
            onClick={() => alert('Регистрацию добавим следующим этапом!')}
          >
            Регистрация
          </button>
        </div>
      </header>

      <main>
        <section className="hero" id="home">
          <div className="hero-content">
            <span className="hero-label">ПЛАТФОРМА ДЛЯ ОБУЧЕНИЯ</span>

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

        <section className="courses-section" id="courses">
          <div className="section-heading">
            <div>
              <span className="section-label">НАЧНИ ОБУЧЕНИЕ</span>
              <h2>Популярные курсы</h2>
              <p>Выбери направление и сделай первый шаг.</p>
            </div>

            <input
              className="search-input"
              type="text"
              placeholder="Поиск курса..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>

          {loading && (
            <p className="empty-message">Загружаем курсы...</p>
          )}

          {error && (
            <p className="empty-message">{error}</p>
          )}

          {!loading && !error && (
            <>
              <div className="courses-grid">
                {filteredCourses.map((course) => (
                  <article className="course-card" key={course.id}>
                    <div className="course-icon">📘</div>

                    <span className="course-category">
                      Программирование
                    </span>

                    <h3>{course.title}</h3>

                    <p>
                      {course.description || 'Описание курса пока отсутствует.'}
                    </p>

                    <div className="course-footer">
                      <span className="course-level">Онлайн-курс</span>

                      <button
                        className="course-button"
                        onClick={() => {
                          window.location.href = `/courses/${course.id}`
                        }}
                        aria-label={`Подробнее о курсе ${course.title}`}
                      >
                        →
                      </button>
                    </div>
                  </article>
                ))}
              </div>

              {filteredCourses.length === 0 && (
                <p className="empty-message">
                  {courses.length === 0
                    ? 'Пока курсов нет. Добавим возможность создавать курсы следующим этапом.'
                    : `Курсы по запросу «${search}» не найдены.`}
                </p>
              )}
            </>
          )}
        </section>

        <section className="about-section" id="about">
          <div>
            <span className="section-label">НАША ЦЕЛЬ</span>
            <h2>Учиться проще, когда есть план</h2>
          </div>

          <p>
            OnlineSchool — учебная платформа, где можно изучать
            материалы, проходить задания, выполнять тесты
            и отслеживать свой прогресс.
          </p>
        </section>
      </main>

      <footer className="footer">
        <a className="logo footer-logo" href="#home">
          <span className="logo-icon">O</span>
          OnlineSchool
        </a>

        <p>© 2026 OnlineSchool. Учись и развивайся.</p>
      </footer>
    </div>
  )
}

export default App
