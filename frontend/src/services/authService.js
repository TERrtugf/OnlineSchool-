import { apiRequest } from './api'

export const getCurrentUser = () =>
  apiRequest('/auth/me')

export const register = (username, password) =>
  apiRequest('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  })

export const login = (username, password) =>
  apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  })

export const logout = () =>
  apiRequest('/auth/logout', {
    method: 'POST',
  })
