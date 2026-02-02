import {
    WebSocketGateway,
    SubscribeMessage,
    WebSocketServer,
    OnGatewayConnection,
    OnGatewayDisconnect,
    MessageBody,
    ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { ActiveUser, FieldSelectionPayload, JoinFormPayload } from './types';
import { getUserColor } from './user-colors.util';

@WebSocketGateway({
    cors: {
        origin: true, 
        credentials: true,
    },
    namespace: '/collaboration',
})
export class CollaborationGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    private readonly logger = new Logger(CollaborationGateway.name);
    private activeUsers: Map<string, Map<string, ActiveUser>> = new Map();

    handleConnection(client: Socket) {
        this.logger.log(`Client connected: ${client.id}`);
    }

    handleDisconnect(client: Socket) {
        this.logger.log(`Client disconnected: ${client.id}`);

        for (const [formId, users] of this.activeUsers.entries()) {
            if (users.has(client.id)) {
                users.delete(client.id);
                this.broadcastActiveUsers(formId);

                if (users.size === 0) {
                    this.activeUsers.delete(formId);
                }
            }
        }
    }

    @SubscribeMessage('join-form')
    handleJoinForm(
        @MessageBody() data: JoinFormPayload,
        @ConnectedSocket() client: Socket,
    ) {
        const { formId, userId, userName, userEmail } = data;

        if (!this.activeUsers.has(formId)) {
            this.activeUsers.set(formId, new Map());
        }

        const formUsers = this.activeUsers.get(formId);
        const color = getUserColor(userId);

        const user: ActiveUser = {
            id: userId,
            name: userName,
            email: userEmail,
            color,
            selectedFieldId: null,
            socketId: client.id,
        };

        
        formUsers.set(client.id, user);

        client.join(`form-${formId}`);

        this.broadcastActiveUsers(formId);

        this.logger.log(`User ${userName} joined form ${formId} (Socket: ${client.id})`);
    }

    @SubscribeMessage('leave-form')
    handleLeaveForm(
        @MessageBody() data: { formId: string; userId: string },
        @ConnectedSocket() client: Socket,
    ) {
        const { formId, userId } = data;

        const formUsers = this.activeUsers.get(formId);
        if (formUsers) {
            
            formUsers.delete(client.id);
            this.broadcastActiveUsers(formId);

            if (formUsers.size === 0) {
                this.activeUsers.delete(formId);
            }
        }

        client.leave(`form-${formId}`);

        this.logger.log(`User ${userId} left form ${formId}`);
    }

    @SubscribeMessage('field-selected')
    handleFieldSelected(
        @MessageBody() data: FieldSelectionPayload,
        @ConnectedSocket() client: Socket,
    ) {
        const { formId, fieldId } = data;

        const formUsers = this.activeUsers.get(formId);
        if (formUsers) {
            
            const user = formUsers.get(client.id);
            if (user) {
                user.selectedFieldId = fieldId;
                this.broadcastActiveUsers(formId);
            }
        }
    }

    @SubscribeMessage('field-deselected')
    handleFieldDeselected(
        @MessageBody() data: { formId: string },
        @ConnectedSocket() client: Socket,
    ) {
        const { formId } = data;

        const formUsers = this.activeUsers.get(formId);
        if (formUsers) {
            
            const user = formUsers.get(client.id);
            if (user) {
                user.selectedFieldId = null;
                this.broadcastActiveUsers(formId);
            }
        }
    }

    private broadcastActiveUsers(formId: string) {
        const formUsers = this.activeUsers.get(formId);
        if (!formUsers) return;

        const usersArray = Array.from(formUsers.values()).map(user => ({
            id: user.id,
            name: user.name,
            email: user.email,
            color: user.color,
            selectedFieldId: user.selectedFieldId,
            socketId: user.socketId,
        }));

        this.server.to(`form-${formId}`).emit('active-users', usersArray);
    }
}
