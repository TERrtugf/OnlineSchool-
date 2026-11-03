import { apiRequest } from './api'

export const getCourses = () =>
  apiRequest('/courses')

export const getCourseById = (courseId) =>
  apiRequest(`/courses/${courseId}`)

export const createCourse = (course) =>
  apiRequest('/courses', {
    method: 'POST',
    body: JSON.stringify(course),
  })

export const updateCourse = (courseId, course) =>
  apiRequest(`/courses/${courseId}`, {
    method: 'PUT',
    body: JSON.stringify(course),
  })

export const deleteCourse = (courseId) =>
  apiRequest(`/courses/${courseId}`, {
    method: 'DELETE',
  })

// Записаться на курс
export const enrollInCourse = (courseId) =>
  apiRequest(`/courses/${courseId}/enroll`, {
    method: 'POST',
  })

export const getMyCourses = () =>
  apiRequest('/courses/my')

export const checkEnrollment = (courseId) =>
  apiRequest(`/courses/${courseId}/enrollment`)