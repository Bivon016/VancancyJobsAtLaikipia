import api from '../api/axios';

export const answerService = {
  submitAnswer: (token, payload) => api.post(`/applicant-answers/${token}`, payload),
  getMyAnswers: (token) => api.get(`/applicant-answers/${token}`),
  getAnswersForPanel: (interviewId) => api.get(`/applicant-answers/interview/${interviewId}/panel`),
};
