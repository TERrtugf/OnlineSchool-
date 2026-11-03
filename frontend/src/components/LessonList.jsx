function LessonList({
  course,
  lessons,
  loading,
  error,
  isCourseAuthor,
  lessonDeleteLoading,
  onOpenLesson,
  onCreateLesson,
  onEditLesson,
  onDeleteLesson,
  onEditCourse,
  onDeleteCourse,
  courseDeleteLoading,
  onBack,
}) {
  return (
    <section className="courses-section">
      <button
        className="login-button"
        onClick={onBack}
        type="button"
      >
        ← Все курсы
      </button>

      {course && isCourseAuthor && (
        <div className="course-management-actions">
          <button
            className="login-button"
            type="button"
            onClick={() => onEditCourse(course)}
          >
            Редактировать курс
          </button>

          <button
            className="login-button"
            type="button"
            disabled={courseDeleteLoading === course.id}
            onClick={() => onDeleteCourse(course)}
          >
            {courseDeleteLoading === course.id
              ? 'Удаление...'
              : 'Удалить курс'}
          </button>
        </div>
      )}

      {loading && (
        <p className="empty-message">
          Загружаем курс и уроки...
        </p>
      )}

      {error && (
        <p className="empty-message">{error}</p>
      )}

      {!loading && course && (
        <>
          <div className="section-heading">
            <div>
              <span className="section-label">
                ОНЛАЙН-ОБУЧЕНИЕ
              </span>

              <h2>{course.title}</h2>

              <p>
                {course.description ||
                  'Описание курса пока отсутствует.'}
              </p>
            </div>
          </div>

          <div className="lesson-list-heading">
            <h3>Уроки курса</h3>

            {isCourseAuthor && (
              <button
                className="register-button"
                type="button"
                onClick={onCreateLesson}
              >
                + Добавить урок
              </button>
            )}
          </div>

          {lessons.length === 0 ? (
            <p className="empty-message">
              В этом курсе пока нет уроков.
            </p>
          ) : (
            <div className="courses-grid">
              {lessons.map((lesson) => (
                <article className="course-card" key={lesson.id}>
                  <div className="course-icon">📖</div>

                  <span className="course-category">
                    Урок {lesson.position}
                  </span>

                  <h3>{lesson.title}</h3>

                  <p>
                    Нажми, чтобы открыть учебный материал.
                  </p>

                  <div className="course-footer">
                    <span className="course-level">
                      Учебный материал
                    </span>

                    <button
                      className="course-button"
                      onClick={() => onOpenLesson(lesson)}
                      aria-label={`Открыть урок ${lesson.title}`}
                      type="button"
                    >
                      →
                    </button>
                  </div>

                  {isCourseAuthor && (
                    <div className="course-management-actions">
                      <button
                        className="login-button"
                        type="button"
                        onClick={() => onEditLesson(lesson)}
                      >
                        Редактировать
                      </button>

                      <button
                        className="login-button"
                        type="button"
                        disabled={lessonDeleteLoading === lesson.id}
                        onClick={() => onDeleteLesson(lesson)}
                      >
                        {lessonDeleteLoading === lesson.id
                          ? 'Удаление...'
                          : 'Удалить'}
                      </button>
                    </div>
                  )}
                </article>
              ))}
            </div>
          )}
        </>
      )}
    </section>
  )
}

export default LessonList
