import { useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import type { Form } from '@/types';
import { useFormStore } from '@/store/formStore';

export const useFormSocket = (id: string | undefined) => {
    const { setSocket, updateForm, currentForm } = useFormStore();

    useEffect(() => {
        if (!id || id.startsWith('temp-')) return;

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

        const socket = io(`${baseUrl}/forms`, {
            path: '/socket.io',
            transports: ['websocket', 'polling'],
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
