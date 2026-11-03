function LessonForm({
  editingLesson,
  courseTitle,
  lessonTitle,
  lessonPosition,
  lessonContent,
  lessonFormError,
  lessonFormLoading,
  onTitleChange,
  onPositionChange,
  onContentChange,
  onSubmit,
  onBack,
}) {
  return (
    <section className="courses-section">
      <button
        className="login-button"
        type="button"
        onClick={onBack}
      >
        ← Назад к урокам
      </button>

      <div className="section-heading">
        <div>
          <span className="section-label">
            УПРАВЛЕНИЕ КОНТЕНТОМ
          </span>

          <h2>
            {editingLesson ? 'Редактировать урок' : 'Создать урок'}
          </h2>

          <p>Курс: {courseTitle}</p>
        </div>
      </div>

      <form className="auth-form" onSubmit={onSubmit}>
        <label htmlFor="lesson-title">Название урока</label>

        <input
          id="lesson-title"
          type="text"
          value={lessonTitle}
          onChange={(event) => onTitleChange(event.target.value)}
          placeholder="Например, Введение в Java"
          maxLength={150}
          required
        />

        <label htmlFor="lesson-position">
          Порядковый номер урока
        </label>

        <input
          id="lesson-position"
          type="number"
          min="1"
          step="1"
          value={lessonPosition}
          onChange={(event) => onPositionChange(event.target.value)}
          required
        />

        <label htmlFor="lesson-content">Содержание урока</label>

        <textarea
          id="lesson-content"
          value={lessonContent}
          onChange={(event) => onContentChange(event.target.value)}
          placeholder="Напиши учебный материал..."
          rows={12}
          maxLength={50000}
          required
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

        {lessonFormError && (
          <p className="auth-error" role="alert">
            {lessonFormError}
          </p>
        )}

        <button
          className="register-button auth-submit"
          type="submit"
          disabled={lessonFormLoading}
        >
          {lessonFormLoading
            ? 'Сохраняем урок...'
            : editingLesson
              ? 'Сохранить изменения'
              : 'Создать урок'}
        </button>
      </form>
    </section>
  )
}

export default LessonForm
