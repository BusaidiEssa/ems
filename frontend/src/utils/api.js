import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  signup: (userData) => api.post('/auth/signup', userData)
};

// Events API - UPDATED
export const eventsAPI = {
  getAll: () => api.get('/events'),
  getOne: (id) => api.get(`/events/${id}`),
  create: (eventData) => api.post('/events', eventData),
  update: (id, eventData) => api.put(`/events/${id}`, eventData),
  delete: (id) => api.delete(`/events/${id}`)
};

// Stakeholder Groups API
export const stakeholderGroupsAPI = {
  getByEvent: (eventId) => api.get(`/stakeholder-groups/event/${eventId}`),
  create: (groupData) => api.post('/stakeholder-groups', groupData),
  update: (id, groupData) => api.put(`/stakeholder-groups/${id}`, groupData),
  delete: (id) => api.delete(`/stakeholder-groups/${id}`)
};

// Registrations API
export const registrationsAPI = {
  getByEvent: (eventId) => api.get(`/registrations/event/${eventId}`),
  create: (regData) => api.post('/registrations', regData),
  toggleCheckIn: (id) => api.patch(`/registrations/${id}/checkin`),
  delete: (id) => api.delete(`/registrations/${id}`)

};

// Emails API
export const emailsAPI = {
  send: (emailData) => api.post('/emails/send', emailData),
  getByEvent: (eventId) => api.get(`/emails/event/${eventId}`)
};

// Analytics API - NEW (3.4)
export const analyticsAPI = {
  getEventAnalytics: (eventId) => api.get(`/analytics/event/${eventId}`),
  createSnapshot: (eventId) => api.post(`/analytics/snapshot/${eventId}`)
};

// Team API - NEW (3.8)
export const teamAPI = {
  getTeamMembers: (eventId) => api.get(`/team/event/${eventId}`),
  inviteMember: (eventId, data) => api.post('/team/invite', { eventId, ...data }),
  acceptInvite: (token) => api.post(`/team/accept/${token}`),
  removeMember: (eventId, userId) => api.delete(`/team/event/${eventId}/member/${userId}`)
};

// Templates API - NEW (3.10)
export const templatesAPI = {
  getAll: () => api.get('/templates'),
  create: (data) => api.post('/templates', data),
  apply: (templateId, eventId) => api.post(`/templates/${templateId}/apply`, { eventId }),
  delete: (id) => api.delete(`/templates/${id}`)
};

export default api;