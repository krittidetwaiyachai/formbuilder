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
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 429 && !originalRequest._retry) {
      originalRequest._retry = true;
      const retryCount = originalRequest._retryCount || 0;
      
      if (retryCount < 5) { 
        originalRequest._retryCount = retryCount + 1;
        
        const waitTime = Math.pow(2, retryCount) * 1000 + Math.random() * 1000;
        
        await new Promise(resolve => setTimeout(resolve, waitTime));
        return api(originalRequest);
      }
    }

    if (error.response?.status === 401) {
      const errorData = error.response?.data;
      const isSessionExpired = errorData?.code === 'SESSION_EXPIRED' || errorData?.message === 'Session expired';

      useAuthStore.getState().logout();

      if (isSessionExpired) {
        window.dispatchEvent(new CustomEvent('session-expired'));
      }

      window.location.href = '/';
    }

    if (error.response?.status === 403) {
      const message = error.response?.data?.message || 'Access Denied: You do not have permission to perform this action.';
      window.dispatchEvent(new CustomEvent('permission-denied', { 
        detail: { message } 
      }));
    }

    return Promise.reject(error);
  },
);

export default api;
