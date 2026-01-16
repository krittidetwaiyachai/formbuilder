import { useEffect } from 'react';
import { io } from 'socket.io-client';
import { useAuthStore } from '@/store/authStore';

export function useSocketLogout() {
  const { token, logout, isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated || !token) return;

    const socketUrl = import.meta.env.VITE_API_URL;
    const backendUrl = import.meta.env.VITE_BACKEND_URL;
    let baseUrl: string;
    
    if (socketUrl) {
      baseUrl = socketUrl.replace('/api', '');
    } else if (backendUrl) {
      baseUrl = backendUrl.replace('/api', '');
    } else {
      baseUrl = window.location.origin;
    }

    const socket = io(baseUrl, {
      query: { token },
      transports: ['websocket', 'polling'],
      path: '/socket.io',
      autoConnect: true,
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
