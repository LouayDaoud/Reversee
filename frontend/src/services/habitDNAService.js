import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const getAuthToken = () => {
  return localStorage.getItem('token');
};

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

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

export const habitDNAService = {
  // Get my Habit DNA
  getMyHabitDNA: async () => {
    const response = await api.get('/habit-dna');
    return response.data;
  },

  // Update/Regenerate Habit DNA
  updateHabitDNA: async () => {
    const response = await api.put('/habit-dna');
    return response.data;
  },

  // Get compatibility with another user
  getCompatibility: async (userId) => {
    const response = await api.get(`/habit-dna/compatibility/${userId}`);
    return response.data;
  },

  // Toggle public visibility
  toggleVisibility: async () => {
    const response = await api.put('/habit-dna/visibility');
    return response.data;
  }
};

export default habitDNAService;

