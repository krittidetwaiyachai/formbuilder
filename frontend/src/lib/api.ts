import axios, { type InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '@/store/authStore';
import { globalToast } from '@/lib/toast-utils';
const API_URL = import.meta.env.VITE_API_URL || '/api';
const RETRY_MAX_ATTEMPTS = 0;
const REQUEST_TIMEOUT_MS = 30000;
const RETRY_BASE_DELAY_MS = 1000;
export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: REQUEST_TIMEOUT_MS
});
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
let refreshPromise: Promise<string | null> | null = null;
const attemptTokenRefresh = async (): Promise<string | null> => {
  const { refreshToken } = useAuthStore.getState();
  try {
    const payload = refreshToken ? { refresh_token: refreshToken } : {};
    const response = await axios.post(`${API_URL}/auth/refresh`, payload, {
      withCredentials: true
    });
    const newAccessToken = response.data?.access_token;
    const newRefreshToken = response.data?.refresh_token;
    if (newAccessToken) {
      const { user, login, setToken } = useAuthStore.getState();
      if (user) {
        login(user, newAccessToken, typeof newRefreshToken === 'string' ? newRefreshToken : undefined);
      } else {
        setToken(newAccessToken);
      }
      return newAccessToken;
    }
    return null;
  } catch {
    return null;
  }
};
const refreshAccessToken = (): Promise<string | null> => {
  if (!refreshPromise) {
    refreshPromise = attemptTokenRefresh().finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
};
interface RetryableRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
  _retryCount?: number;
}
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as RetryableRequestConfig | undefined;
    const requestUrl = typeof originalRequest?.url === 'string' ? originalRequest.url : '';
    const isAuthRequest =
    requestUrl.includes('/auth/login') ||
    requestUrl.includes('/auth/google/login') ||
    requestUrl.includes('/auth/refresh');
    if (error.response?.status === 429 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true;
      const retryCount = originalRequest._retryCount || 0;
      if (retryCount < RETRY_MAX_ATTEMPTS) {
        originalRequest._retryCount = retryCount + 1;
        const waitTime = Math.pow(2, retryCount) * RETRY_BASE_DELAY_MS + Math.random() * 1000;
        await new Promise((resolve) => setTimeout(resolve, waitTime));
        return api(originalRequest);
      }
      globalToast({
        title: 'error.rate_limit.title',
        description: 'error.rate_limit.message',
        variant: 'error',
        duration: 5000
      });
    }
    if (error.response?.status === 401 && !isAuthRequest && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true;
      const newToken = await refreshAccessToken();
      if (newToken) {
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      }
      const errorData = error.response?.data;
      const isSessionExpired = errorData?.code === 'SESSION_EXPIRED' || errorData?.message === 'Session expired';
      useAuthStore.getState().logout();
      if (isSessionExpired) {
        window.dispatchEvent(new CustomEvent('session-expired'));
      }
      window.location.href = '/';
    }
    if (error.response?.status === 403) {
      const message =
      error.response?.data?.message || 'Access Denied: You do not have permission to perform this action.';
      window.dispatchEvent(
        new CustomEvent('permission-denied', {
          detail: { message }
        })
      );
    }
    return Promise.reject(error);
  }
);
export default api;