const API_URL = '/api'

export async function apiRequest(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    credentials: 'include',
    ...options,
    headers: {
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...options.headers,
    },
  })

  if (!response.ok) {
    const data = await response.json().catch(() => ({}))

    const error = new Error(
      data.message ||
      data.detail ||
      `Ошибка запроса. HTTP ${response.status}`,
    )

    error.status = response.status
    throw error
  }

  if (response.status === 204) {
    return null
  }

  return response.json()
}
