import { io, Socket } from 'socket.io-client';
import type { ActiveUser, JoinFormPayload, FieldSelectionPayload } from '../types/collaboration';
import { resolveSocketBaseUrl } from '@/lib/socket-url';
import { useAuthStore } from '@/store/authStore';
class CollaborationService {
  private socket: Socket | null = null;
  private SOCKET_URL = '';
  private socketToken: string | null = null;
  constructor() {
    this.SOCKET_URL = resolveSocketBaseUrl();
  }
  connect() {
    const token = useAuthStore.getState().token;
    if (!token) {
      return null;
    }
    if (this.socket?.connected && this.socketToken === token) {
      return this.socket;
    }
    if (this.socket && this.socketToken !== token) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.socket = io(`${this.SOCKET_URL}/collaboration`, {
      withCredentials: true,
      transports: ['websocket', 'polling'],
      path: '/socket.io',
      auth: { token },
      query: { token }
    });
    this.socketToken = token;
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
      this.socketToken = null;
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
    const handler = (users: ActiveUser[]) => {
      callback(users);
    };
    this.socket?.on('active-users', handler);
    return () => {
      this.socket?.off('active-users', handler);
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
