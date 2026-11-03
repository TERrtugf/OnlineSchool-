function AuthForm({
  authMode,
  username,
  password,
  authError,
  authLoading,
  onClose,
  onSubmit,
  onUsernameChange,
  onPasswordChange,
  onSwitchMode,
}) {
  if (!authMode) {
    return null
  }

  return (
    <div
      className="auth-overlay"
      onClick={onClose}
    >
      <div
        className="auth-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-title"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          className="auth-close"
          type="button"
          aria-label="Закрыть"
          onClick={onClose}
        >
          ×
        </button>

        <span className="section-label">ONLINESCHOOL</span>

        <h2 id="auth-title">
          {authMode === 'login'
            ? 'С возвращением!'
            : 'Создать аккаунт'}
        </h2>

        <p className="auth-description">
          {authMode === 'login'
            ? 'Войди, чтобы продолжить обучение.'
            : 'Зарегистрируйся и начни обучение.'}
        </p>

        <form className="auth-form" onSubmit={onSubmit}>
          <label htmlFor="auth-username">Логин</label>

          <input
            id="auth-username"
            type="text"
            autoComplete="username"
            minLength={3}
            maxLength={50}
            value={username}
            onChange={(event) =>
              onUsernameChange(event.target.value)
            }
            placeholder="Введи логин"
            required
          />

          <label htmlFor="auth-password">Пароль</label>

          <input
            id="auth-password"
            type="password"
            autoComplete={
              authMode === 'login'
                ? 'current-password'
                : 'new-password'
            }
            minLength={8}
            maxLength={72}
            value={password}
            onChange={(event) =>
              onPasswordChange(event.target.value)
            }
            placeholder="Минимум 8 символов"
            required
          />

          {authError && (
            <p className="auth-error" role="alert">
              {authError}
            </p>
          )}

          <button
            className="register-button auth-submit"
            type="submit"
            disabled={authLoading}
          >
            {authLoading
              ? 'Подождите...'
              : authMode === 'login'
                ? 'Войти'
                : 'Зарегистрироваться'}
          </button>
        </form>

        <p className="auth-switch">
          {authMode === 'login'
            ? 'Ещё нет аккаунта?'
            : 'Уже есть аккаунт?'}{' '}

          <button
            type="button"
            onClick={onSwitchMode}
          >
            {authMode === 'login' ? 'Регистрация' : 'Войти'}
          </button>
        </p>
      </div>
    </div>
  )
}

export default AuthForm
