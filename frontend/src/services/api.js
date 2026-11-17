import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth
export const signup = (name, email, password) => {
  return api.post('/auth/signup', { name, email, password });
};

export const login = (email, password) => {
  return api.post('/auth/login', { email, password });
};

// Readings
export const getReadings = () => {
  return api.get('/readings');
};

export const getReading = (id) => {
  return api.get(`/readings/${id}`);
};

export const addReading = (date, slot, value) => {
  return api.post('/readings', { date, slot, value });
};

export const updateReading = (id, date, slot, value) => {
  return api.put(`/readings/${id}`, { date, slot, value });
};

export const deleteReading = (id) => {
  return api.delete(`/readings/${id}`);
};

// Reports
export const getDailyReport = (date) => {
  return api.get(`/reports/daily?date=${date}`);
};

export const getMonthToDateReport = (date) => {
  return api.get(`/reports/month-to-date?date=${date}`);
};

export const getMonthlyReport = (date) => {
  return api.get(`/reports/monthly?date=${date}`);
};

export default api;
