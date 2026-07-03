import api from '../api/axios';

export const scoreService = {
  submitScore: (payload) => api.post('/answer-scores', payload),
  getScoresForInterview: (interviewId) => api.get(`/answer-scores/interview/${interviewId}`),
};
