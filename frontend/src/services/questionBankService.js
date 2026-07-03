import api from '../api/axios';

export const questionBankService = {
  create: (data) => api.post('/interview-questions', data),
  createBatch: (data) => api.post('/interview-questions/batch', data),
  getAll: (params) => api.get('/interview-questions', { params }),
  getById: (id) => api.get(`/interview-questions/${id}`),
  update: (id, data) => api.patch(`/interview-questions/${id}`, data),
  delete: (id) => api.delete(`/interview-questions/${id}`),
};
