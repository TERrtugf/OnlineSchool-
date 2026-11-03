import { apiRequest } from './api'

export async function getLessonTest(lessonId) {
  try {
    return await apiRequest(`/lessons/${lessonId}/tests`)
  } catch (error) {
    if (error.status === 404) {
      return null
    }
    throw error
  }
}

export const createTest = (lessonId, test) =>
  apiRequest(`/lessons/${lessonId}/tests`, {
    method: 'POST',
    body: JSON.stringify(test),
  })

export const addQuestion = (testId, question) =>
  apiRequest(`/tests/${testId}/questions`, {
    method: 'POST',
    body: JSON.stringify(question),
  })

export const updateQuestion = (questionId, text) =>
  apiRequest(`/questions/${questionId}`, {
    method: 'PUT',
    body: JSON.stringify({ text }),
  })

export const deleteQuestion = (questionId) =>
  apiRequest(`/questions/${questionId}`, {
    method: 'DELETE',
  })

export const getAuthorAnswers = (questionId) =>
  apiRequest(`/questions/${questionId}/author-answers`)

export const addAnswerOption = (questionId, option) =>
  apiRequest(`/questions/${questionId}/answers`, {
    method: 'POST',
    body: JSON.stringify({
      text: option.text,
      correct: option.correct,
    }),
  })

export const updateAnswerOption = (optionId, option) =>
  apiRequest(`/answer-options/${optionId}`, {
    method: 'PUT',
    body: JSON.stringify({
      text: option.text,
      correct: option.correct,
    }),
  })

export const deleteAnswerOption = (optionId) =>
  apiRequest(`/answer-options/${optionId}`, {
    method: 'DELETE',
  })

export const submitTest = (testId, answers) =>
  apiRequest(`/tests/${testId}/submit`, {
    method: 'POST',
    body: JSON.stringify({ answers }),
  })

export const getTestById = (testId) =>
  apiRequest(`/tests/${testId}`)