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

export const arService = {
  // Create AR session
  createARSession: async (sessionData) => {
    const response = await api.post('/ar/sessions', sessionData);
    return response.data;
  },

  // Get my AR sessions
  getMyARSessions: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.sessionType) params.append('sessionType', filters.sessionType);
    if (filters.limit) params.append('limit', filters.limit);
    
    const response = await api.get(`/ar/sessions?${params.toString()}`);
    return response.data;
  },

  // Get AR session by ID
  getARSession: async (id) => {
    const response = await api.get(`/ar/sessions/${id}`);
    return response.data;
  },

  // Update AR session
  updateARSession: async (id, updateData) => {
    const response = await api.put(`/ar/sessions/${id}`, updateData);
    return response.data;
  },

  // Add capture
  addCapture: async (id, captureData) => {
    const response = await api.post(`/ar/sessions/${id}/captures`, captureData);
    return response.data;
  },

  // Toggle share
  toggleShare: async (id) => {
    const response = await api.put(`/ar/sessions/${id}/share`);
    return response.data;
  },

  // Generate QR code
  generateQRCode: async (qrData) => {
    const response = await api.post('/ar/qr-code', qrData);
    return response.data;
  }
};

export default arService;

