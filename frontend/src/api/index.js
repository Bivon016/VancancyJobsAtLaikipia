import api from "./axios";

export const authApi = {
  login: (email, password) => api.post("/auth/login", { email, password }),
  register: (data) => api.post("/auth/register", data),
  verifyEmail: (email, code) => api.post("/auth/verify-email", { email, code }),
  resendVerificationCode: (email) =>
    api.post("/auth/resend-verification-code", { email }),
};

export const jobsApi = {
  getAllOpen: () => api.get("/jobs/allVacancies"),
  getById: (id) => api.get(`/jobs/${id}`),
  create: (data) => api.post("/jobs", data),
  close: (id) => api.put(`/jobs/${id}/close`),
  open: (id) => api.put(`/jobs/${id}/open`),
  delete: (id) => api.delete(`/jobs/${id}`),
};

export const departmentsApi = {
  getAll: () => api.get("/departments/allDepartments"),
  create: (data) => api.post("/departments/create", data),
  update: (id, data) => api.patch(`/departments/${id}`, data),
  delete: (id) => api.delete(`/departments/${id}`),
};

export const profileApi = {
  get: () => api.get("/applicant/profile"),
  create: (data) => api.post("/applicant/profile", data),
  update: (data) => api.put("/applicant/profile", data),
};

export const applicationsApi = {
  apply: (vacancyId) => api.post("/applications/apply", { vacancyId }),
  getMy: () => api.get("/applications/my"),
  getByVacancy: (vacancyId) => api.get(`/applications/vacancy/${vacancyId}`),
  getAll: () => api.get("/applications/all"),
  updateStatus: (id, status, remarks) =>
    api.put(`/applications/${id}/status`, { status, remarks }),
};

export const documentsApi = {
  upload: (file, documentType, applicationId, onProgress) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("documentType", documentType);
    formData.append("applicationId", applicationId);
    return api.post("/documents/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
      onUploadProgress: onProgress,
    });
  },
  getByApplication: (applicationId) =>
    api.get(`/documents/application/${applicationId}`),
  getMyByApplication: (applicationId) =>
    api.get(`/documents/my/${applicationId}`),
};

export const notificationsApi = {
  getMy: () => api.get("/notifications/my"),
  getUnread: () => api.get("/notifications/unread"),
  markRead: (id) => api.put(`/notifications/${id}/read`),
};

export const recruitmentApi = {
  submit: (data) => api.post("/recruitment/submit", data),
  approve: (id) => api.put(`/recruitment/${id}/approve`),
  reject: (id) => api.put(`/recruitment/${id}/reject`),
  getPending: () => api.get("/recruitment/pending"),
  getAll: () => api.get("/recruitment/all"),
  getByDepartment: (departmentId) =>
    api.get(`/recruitment/department/${departmentId}`),
};

export const shortlistApi = {
  create: (data) => api.post("/shortlist", data),
  getByVacancy: (vacancyId) => api.get(`/shortlist/vacancy/${vacancyId}`),
};

export const interviewsApi = {
  schedule: (data) => api.post("/interviews/schedule", data),
  addPanelMember: (data) => api.post("/interviews/panel", data),
  getMy: () => api.get("/interviews/my"),
  getByStatus: (status) => api.get(`/interviews/status/${status}`),
  complete: (id) => api.put(`/interviews/${id}/complete`),
};


export const scoresApi = {
  submit: (data) => api.post("/scores", data),
  getByInterview: (id) => api.get(`/scores/interview/${id}`),
  getAverage: (id) => api.get(`/scores/interview/${id}/average`),
};

export const selectionsApi = {
  create: (data) => api.post("/selections", data),
  appoint: (id, status) =>
    api.put(`/selections/${id}/appoint`, null, { params: { status } }),
  getByVacancy: (vacancyId) => api.get(`/selections/vacancy/${vacancyId}`),
};

export const adminApi = {
  createUser: (data) => api.post("/admin/users/create", data),
  getUsers: (roles) =>
    Promise.all(
      roles.map((role) => api.get("/admin/users", { params: { roles: role } }))
    ).then((responses) => ({
      data: responses.flatMap((r) => r.data),
    })),
};