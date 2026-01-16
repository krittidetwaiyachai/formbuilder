import axios from 'axios';
import { useAuthStore } from '@/store/authStore';

const API_URL = import.meta.env.VITE_API_URL || '/api';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const errorData = error.response?.data;
      const isSessionExpired = errorData?.code === 'SESSION_EXPIRED' || errorData?.message === 'Session expired';

      useAuthStore.getState().logout();

      if (isSessionExpired) {
        window.dispatchEvent(new CustomEvent('session-expired'));
      }

      window.location.href = '/';
    }
    return Promise.reject(error);
  },
);

export default api;


