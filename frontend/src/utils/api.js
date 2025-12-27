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

// Events API
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
  toggleCheckIn: (id) => api.patch(`/registrations/${id}/checkin`)
};

// Emails API
export const emailsAPI = {
  send: (emailData) => api.post('/emails/send', emailData),
  getByEvent: (eventId) => api.get(`/emails/event/${eventId}`)
};

export default api;