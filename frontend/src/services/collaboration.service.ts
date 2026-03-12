import { io, Socket } from 'socket.io-client';
import type { ActiveUser, JoinFormPayload, FieldSelectionPayload } from '../types/collaboration';
class CollaborationService {
  private socket: Socket | null = null;
  private SOCKET_URL = '';
  constructor() {
    const socketUrl = import.meta.env.VITE_API_URL;
    const backendUrl = import.meta.env.VITE_BACKEND_URL;
    let baseUrl: string;
    if (socketUrl) {
      baseUrl = socketUrl.replace('/api', '');
    } else if (backendUrl) {
      baseUrl = backendUrl.replace('/api', '');
    } else {
      baseUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
    }
    this.SOCKET_URL = baseUrl;
  }
  connect() {
    if (this.socket?.connected) {
      return this.socket;
    }
    this.socket = io(`${this.SOCKET_URL}/collaboration`, {
      withCredentials: true,
      transports: ['websocket', 'polling'],
      path: '/socket.io'
    });
    this.socket.on('connect', () => {
    });
    this.socket.on('disconnect', () => {
    });
    this.socket.on('connect_error', (error) => {
      console.error('Collaboration socket error:', error);
    });
    return this.socket;
  }
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
  joinForm(data: JoinFormPayload) {
    if (!this.socket) {
      this.connect();
    }
    this.socket?.emit('join-form', data);
  }
  leaveForm(formId: string, userId: string) {
    this.socket?.emit('leave-form', { formId, userId });
  }
  selectField(data: FieldSelectionPayload) {
    this.socket?.emit('field-selected', data);
  }
  deselectField(formId: string, userId: string) {
    this.socket?.emit('field-deselected', { formId, userId });
  }
  onActiveUsersUpdate(callback: (users: ActiveUser[]) => void) {
    this.socket?.on('active-users', (users) => {
      callback(users);
    });
    return () => {
      this.socket?.off('active-users', callback);
    };
  }
  getSocket() {
    return this.socket;
  }
  getDebugInfo() {
    return {
      connected: this.socket?.connected || false,
      socketId: this.socket?.id,
      url: `${this.SOCKET_URL}/collaboration`,
      transport: this.socket?.io?.engine?.transport?.name
    };
  }
}
export const collaborationService = new CollaborationService();