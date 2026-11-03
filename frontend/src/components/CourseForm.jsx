function CourseForm({
  editingCourse,
  courseTitle,
  courseDescription,
  courseFormError,
  courseFormLoading,
  onTitleChange,
  onDescriptionChange,
  onSubmit,
  onBack,
}) {
  return (
    <section className="courses-section">
      <button
        className="login-button"
        onClick={onBack}
        type="button"
      >
        ← Назад к курсам
      </button>

      <div className="section-heading">
        <div>
          <span className="section-label">
            УПРАВЛЕНИЕ КОНТЕНТОМ
          </span>

          <h2>
            {editingCourse ? 'Редактировать курс' : 'Создать курс'}
          </h2>

          <p>
            {editingCourse
              ? 'Измени название или описание курса.'
              : 'Заполни информацию о новом учебном курсе.'}
          </p>
        </div>
      </div>

      <form className="auth-form" onSubmit={onSubmit}>
        <label htmlFor="course-title">Название курса</label>

        <input
          id="course-title"
          type="text"
          value={courseTitle}
          onChange={(event) => onTitleChange(event.target.value)}
          placeholder="Например, Основы Java"
          maxLength={150}
          required
        />

        <label htmlFor="course-description">Описание курса</label>

        <textarea
          id="course-description"
          value={courseDescription}
          onChange={(event) =>
            onDescriptionChange(event.target.value)
          }
          placeholder="Расскажи, чему научится ученик"
          rows={5}
          maxLength={5000}
          style={{
            width: '100%',
            padding: '12px',
            border: '1px solid #ddd',
            borderRadius: '8px',
            font: 'inherit',
            resize: 'vertical',
            boxSizing: 'border-box',
          }}
        />

        {courseFormError && (
          <p className="auth-error" role="alert">
            {courseFormError}
          </p>
        )}

        <button
          className="register-button auth-submit"
          type="submit"
          disabled={courseFormLoading}
        >
          {courseFormLoading
            ? 'Сохраняем курс...'
            : editingCourse
              ? 'Сохранить изменения'
              : 'Создать курс'}
        </button>
      </form>
    </section>
  )
}

export default CourseForm
