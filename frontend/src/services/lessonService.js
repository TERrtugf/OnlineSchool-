import { apiRequest } from './api'

export const getLessons = (courseId) =>
  apiRequest(`/courses/${courseId}/lessons`)

export const getLesson = (lessonId) =>
  apiRequest(`/lessons/${lessonId}`)

export const createLesson = (courseId, lesson) =>
  apiRequest(`/courses/${courseId}/lessons`, {
    method: 'POST',
    body: JSON.stringify(lesson),
  })

export const updateLesson = (lessonId, lesson) =>
  apiRequest(`/lessons/${lessonId}`, {
    method: 'PUT',
    body: JSON.stringify(lesson),
  })

export const deleteLesson = (lessonId) =>
  apiRequest(`/lessons/${lessonId}`, {
    method: 'DELETE',
  })
