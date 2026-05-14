import { useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import type { Form } from '@/types';
import { useFormStore } from '@/store/formStore';
import { resolveSocketBaseUrl } from '@/lib/socket-url';
import { useAuthStore } from '@/store/authStore';
export const useFormSocket = (id: string | undefined) => {
  const { setSocket, updateForm, currentForm } = useFormStore();
  const token = useAuthStore((state) => state.token);
  useEffect(() => {
    if (!id || id.startsWith('temp-') || !token) return;
    const baseUrl = resolveSocketBaseUrl();
    const socket = io(`${baseUrl}/forms`, {
      path: '/socket.io',
      transports: ['websocket', 'polling'],
      withCredentials: true,
      auth: { token },
      query: { token }
    });
    socket.on('connect', () => {
      socket.emit('join_form', id);
    });
    socket.on('connect_error', (error) => {
      console.error('Form socket connection error:', error);
    });
    socket.on('form_updated', (data: Form) => {
      updateForm(data, false);
    });
    setSocket(socket);
    return () => {
      socket.emit('leave_form', id);
      socket.disconnect();
      setSocket(null);
    };
  }, [id, token, setSocket, updateForm]);
};