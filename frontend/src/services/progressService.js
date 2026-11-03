import { apiRequest } from './api'

export const getUserProgress = (userId) =>
  apiRequest(`/progress/${userId}`)

export const updateProgress = (userId, lessonId, action) =>
  apiRequest(`/progress/${userId}/lessons/${lessonId}/${action}`, {
    method: 'POST',
  })
