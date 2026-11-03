function Header({
  user,
  onGoHome,
  onOpenAuth,
  onLogout,
  onCreateCourse,
  onOpenProfile,
}) {
  return (
    <header className="header">
      <a className="logo" href="#home" onClick={onGoHome}>
        <span className="logo-icon">O</span>
        OnlineSchool
      </a>

      <nav className="navigation">
        <a href="#home" onClick={onGoHome}>Главная</a>
        <a href="#courses" onClick={onGoHome}>Курсы</a>
        <a href="#about" onClick={onGoHome}>О проекте</a>
      </nav>

      <div className="header-actions">
        {user ? (
          <>
            <span className="user-greeting">
              Привет, {user.username}!
            </span>

            <button
              className="login-button"
              onClick={onOpenProfile}
              type="button"
            >
              Личный кабинет
            </button>

            <button
              className="register-button"
              onClick={onCreateCourse}
              type="button"
            >
              Создать курс
            </button>

            <button
              className="login-button"
              onClick={onLogout}
              type="button"
            >
              Выйти
            </button>
          </>
        ) : (
          <>
            <button
              className="login-button"
              onClick={() => onOpenAuth('login')}
              type="button"
            >
              Войти
            </button>

            <button
              className="register-button"
              onClick={() => onOpenAuth('register')}
              type="button"
            >
              Регистрация
            </button>
          </>
        )}
      </div>
    </header>
  )
}

export default Header
