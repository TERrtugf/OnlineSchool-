function CourseList({
  courses,
  filteredCourses,
  search,
  loading,
  error,
  user,
  isCourseAuthor,
  courseDeleteLoading,
  enrolledCourseIds = [],
  onEnroll,
  onUnenroll,
  enrollmentLoading,
  enrollmentError,
  onSearchChange,
  onOpenCourse,
  onEditCourse,
  onDeleteCourse,
}) {
  return (
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
          onChange={(event) => onSearchChange(event.target.value)}
        />
      </div>

      {loading && (
        <p className="empty-message">Загружаем курсы...</p>
      )}

      {error && (
        <p className="empty-message">{error}</p>
      )}

      {enrollmentError && (
        <p className="error-message" role="alert">
          {enrollmentError}
        </p>
      )}

      {!loading && !error && (
        <>
          <div className="courses-grid">
            {filteredCourses.map((course) => {
              const isEnrolled = enrolledCourseIds.some(
                (id) => Number(id) === Number(course.id),
              )

              const isAuthor = user && isCourseAuthor(course)

              const isProcessing =
                Number(enrollmentLoading) === Number(course.id)

              return (
                <article className="course-card" key={course.id}>
                  <div className="course-icon">📘</div>

                  <span className="course-category">
                    Программирование
                  </span>

                  <h3>{course.title}</h3>

                  <p>
                    {course.description ||
                      'Описание курса пока отсутствует.'}
                  </p>

                  <div className="course-footer">
                    <span className="course-level">
                      Онлайн-курс
                    </span>

                    <button
                      className="course-button"
                      type="button"
                      onClick={() => onOpenCourse(course.id)}
                      aria-label={`Подробнее о курсе ${course.title}`}
                    >
                      →
                    </button>
                  </div>

                  {/* Действия обычного пользователя */}

                  {user && !isAuthor && (
                    <div className="course-management-actions">
                      {isEnrolled ? (
                        <>
                          <button
                            className="login-button"
                            type="button"
                            onClick={() => onOpenCourse(course.id)}
                          >
                            Перейти к курсу
                          </button>

                          <button
                            className="login-button"
                            type="button"
                            disabled={isProcessing}
                            onClick={() => onUnenroll(course.id)}
                          >
                            {isProcessing
                              ? 'Отписываем...'
                              : 'Отписаться'}
                          </button>
                        </>
                      ) : (
                        <button
                          className="login-button"
                          type="button"
                          disabled={isProcessing}
                          onClick={() => onEnroll(course.id)}
                        >
                          {isProcessing
                            ? 'Записываем...'
                            : 'Записаться'}
                        </button>
                      )}
                    </div>
                  )}

                  {/* Действия автора курса */}

                  {user && isAuthor && (
                    <div className="course-management-actions">
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
                        disabled={courseDeleteLoading === course.id}
                        onClick={() => onDeleteCourse(course)}
                      >
                        {courseDeleteLoading === course.id
                          ? 'Удаление...'
                          : 'Удалить'}
                      </button>
                    </div>
                  )}
                </article>
              )
            })}
          </div>

          {filteredCourses.length === 0 && (
            <p className="empty-message">
              {courses.length === 0
                ? 'Пока курсов нет.'
                : `Курсы по запросу «${search}» не найдены.`}
            </p>
          )}
        </>
      )}
    </section>
  )
}

export default CourseList
