import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Get auth token from localStorage
const getAuthToken = () => {
  return localStorage.getItem('token');
};

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Admin functions
export const scheduledHabitService = {
  // Assign a scheduled habit to a user (Admin only)
  assignScheduledHabit: async (habitData) => {
    const response = await api.post('/admin/scheduled-habits', habitData);
    return response.data;
  },

  // Get all scheduled habits (Admin)
  getAllScheduledHabits: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.userId) params.append('userId', filters.userId);
    if (filters.status) params.append('status', filters.status);
    
    const response = await api.get(`/admin/scheduled-habits?${params.toString()}`);
    return response.data;
  },

  // Get scheduled habit by ID (Admin)
  getScheduledHabitById: async (id) => {
    const response = await api.get(`/admin/scheduled-habits/${id}`);
    return response.data;
  },

  // Update scheduled habit (Admin)
  updateScheduledHabit: async (id, habitData) => {
    const response = await api.put(`/admin/scheduled-habits/${id}`, habitData);
    return response.data;
  },

  // Delete scheduled habit (Admin)
  deleteScheduledHabit: async (id) => {
    const response = await api.delete(`/admin/scheduled-habits/${id}`);
    return response.data;
  },

  // User functions
  // Get my scheduled habits (User)
  getMyScheduledHabits: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.status) params.append('status', filters.status);
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    
    const response = await api.get(`/scheduled-habits?${params.toString()}`);
    return response.data;
  },

  // Get scheduled habits for calendar view (User)
  getScheduledHabitsForCalendar: async (startDate, endDate) => {
    const params = new URLSearchParams();
    params.append('startDate', startDate);
    params.append('endDate', endDate);
    
    const response = await api.get(`/scheduled-habits/calendar?${params.toString()}`);
    return response.data;
  }
};

export default scheduledHabitService;

