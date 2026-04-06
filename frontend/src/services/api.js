import axios from 'axios';

const api = axios.create({
  baseURL: (import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api/v1',
});

// Request interceptor to attach token
api.interceptors.request.use(
  (config) => {
    // Assuming we parse session storage manually or we will set it from zustand
    const authStorage = sessionStorage.getItem('auth-storage');
    if (authStorage) {
      try {
        const { state } = JSON.parse(authStorage);
        if (state.accessToken) {
          config.headers.Authorization = `Bearer ${state.accessToken}`;
        }
      } catch (err) {
        console.error('Failed to parse auth storage', err);
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle 401 globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear storage and redirect to login if unauthorized
      sessionStorage.removeItem('auth-storage');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
