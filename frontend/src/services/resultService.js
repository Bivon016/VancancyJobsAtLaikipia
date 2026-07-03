import api from '../api/axios';

export const resultService = {
  finalize: (interviewId, payload) => api.post(`/online-interview-results/${interviewId}/finalize`, payload),
  getResult: (interviewId) => api.get(`/online-interview-results/${interviewId}`),
  getResultsForVacancy: (vacancyId, recommendation) =>
    api.get(`/online-interview-results/vacancy/${vacancyId}`, { params: { recommendation } }),
  getAll: () => api.get('/online-interview-results'),
};
