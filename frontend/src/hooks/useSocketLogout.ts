import { useEffect } from 'react';
import { io } from 'socket.io-client';
import { useAuthStore } from '@/store/authStore';
import { resolveSocketBaseUrl } from '@/lib/socket-url';
export function useSocketLogout() {
  const { token, logout, isAuthenticated } = useAuthStore();
  useEffect(() => {
    if (!isAuthenticated || !token) return;
    const baseUrl = resolveSocketBaseUrl();
    const socket = io(baseUrl, {
      query: { token },
      transports: ['websocket', 'polling'],
      path: '/socket.io',
      autoConnect: true
    });
    socket.on('connect', () => {
    });
    socket.on('force_logout', () => {
      logout();
      window.location.href = '/';
    });
    return () => {
      socket.disconnect();
    };
  }, [isAuthenticated, token, logout]);
}