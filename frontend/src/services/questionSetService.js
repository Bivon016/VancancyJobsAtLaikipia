import api from '../api/axios';

export const questionSetService = {
  getAll: () => api.get('/question-sets'),
  getById: (id) => api.get(`/question-sets/${id}`),
  getByVacancy: (vacancyId) => api.get(`/question-sets/vacancy/${vacancyId}`),
  create: (data) => api.post('/question-sets', data),
  addQuestion: (id, data) => api.post(`/question-sets/${id}/questions`, data),
  deleteQuestion: (id, questionId) => api.delete(`/question-sets/${id}/questions/${questionId}`),
  publish: (id) => api.patch(`/question-sets/${id}/publish`),
  unpublish: (id) => api.patch(`/question-sets/${id}/unpublish`),
  update: (id, data) => api.patch(`/question-sets/${id}`, data),
};
