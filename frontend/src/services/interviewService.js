import api from '../api/axios';

export const interviewService = {
  create: (data) => api.post('/online-interviews', data),
  createForVacancy: (vacancyId, data) => api.post(`/online-interviews/vacancy/${vacancyId}`, data),
  start: (token) => api.post(`/online-interviews/${token}/start`),
  submit: (token) => api.post(`/online-interviews/${token}/submit`),
  getByToken: (token) => api.get(`/online-interviews/token/${token}`),
  getMy: () => api.get('/online-interviews/my'),
  getAll: (params) => api.get('/online-interviews', { params }),
  getById: (id) => api.get(`/online-interviews/${id}`),
  expire: (id) => api.patch(`/online-interviews/${id}/expire`),
};
