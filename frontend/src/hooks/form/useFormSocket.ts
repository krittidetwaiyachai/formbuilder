import { useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import type { Form } from '@/types';
import { useFormStore } from '@/store/formStore';
import { resolveSocketBaseUrl } from '@/lib/socket-url';
export const useFormSocket = (id: string | undefined) => {
  const { setSocket, updateForm, currentForm } = useFormStore();
  useEffect(() => {
    if (!id || id.startsWith('temp-')) return;
    const baseUrl = resolveSocketBaseUrl();
    const socket = io(`${baseUrl}/forms`, {
      path: '/socket.io',
      transports: ['websocket', 'polling']
    });
    socket.on('connect', () => {
      socket.emit('join_form', id);
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
  }, [id, setSocket, updateForm]);
};